import * as cookie from "cookie";
import { randomBytes } from "node:crypto";
import type { Context } from "hono";
import * as jose from "jose";
import { setCookie, deleteCookie } from "hono/cookie";
import { Errors } from "@contracts/errors";
import { Paths, Session } from "@contracts/constants";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { findUserByUnionId, upsertUser } from "./queries/users";
import { signSessionToken, verifySessionToken } from "./session";

const STATE_COOKIE = "google_oauth_state";
const googleJwks = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

function isGoogleConfigured() {
  return (
    Boolean(env.googleClientId && env.googleClientSecret) &&
    new TextEncoder().encode(env.sessionSecret).length >= 32
  );
}

function getRedirectUri(c: Context) {
  return (
    env.googleRedirectUri ||
    new URL(Paths.googleCallback, c.req.url).toString()
  );
}

function oauthCookieOptions(c: Context) {
  return {
    ...getSessionCookieOptions(c.req.raw.headers),
    path: Paths.googleAuth,
    sameSite: "Lax" as const,
  };
}

export function createGoogleAuthHandlers() {
  const start = (c: Context) => {
    if (!isGoogleConfigured()) {
      return c.text(
        "Google sign-in is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and a SESSION_SECRET of at least 32 bytes.",
        503,
      );
    }

    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    setCookie(c, STATE_COOKIE, `${state}.${nonce}`, {
      ...oauthCookieOptions(c),
      maxAge: 600,
    });

    const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizeUrl.searchParams.set("client_id", env.googleClientId);
    authorizeUrl.searchParams.set("redirect_uri", getRedirectUri(c));
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("nonce", nonce);

    return c.redirect(authorizeUrl.toString(), 302);
  };

  const callback = async (c: Context) => {
    const storedState = cookie.parse(c.req.header("cookie") ?? "")[STATE_COOKIE];
    deleteCookie(c, STATE_COOKIE, oauthCookieOptions(c));

    const state = c.req.query("state");
    const code = c.req.query("code");
    if (
      !isGoogleConfigured() ||
      !state ||
      !code ||
      !storedState ||
      !storedState.startsWith(`${state}.`)
    ) {
      return c.redirect(`${Paths.login}?error=google_signin_failed`, 302);
    }

    const nonce = storedState.slice(state.length + 1);
    if (!nonce) {
      return c.redirect(`${Paths.login}?error=google_signin_failed`, 302);
    }

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.googleClientId,
          client_secret: env.googleClientSecret,
          redirect_uri: getRedirectUri(c),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Google token exchange failed (${tokenResponse.status})`);
      }

      const tokens: unknown = await tokenResponse.json();
      if (
        typeof tokens !== "object" ||
        tokens === null ||
        !("id_token" in tokens) ||
        typeof tokens.id_token !== "string"
      ) {
        throw new Error("Google token response did not include an ID token");
      }

      const { payload } = await jose.jwtVerify(tokens.id_token, googleJwks, {
        audience: env.googleClientId,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      });
      if (
        typeof payload.sub !== "string" ||
        typeof payload.email !== "string" ||
        payload.email_verified !== true ||
        payload.nonce !== nonce
      ) {
        throw new Error("Google ID token is missing verified identity claims");
      }

      const email = payload.email.trim().toLowerCase();
      await upsertUser({
        unionId: payload.sub,
        email,
        name: typeof payload.name === "string" ? payload.name : null,
        avatar: typeof payload.picture === "string" ? payload.picture : null,
        lastSignInAt: new Date(),
      });

      const sessionToken = await signSessionToken({
        unionId: payload.sub,
        clientId: env.googleClientId,
      });
      setCookie(c, Session.cookieName, sessionToken, {
        ...getSessionCookieOptions(c.req.raw.headers),
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/admin", 302);
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      return c.redirect(`${Paths.login}?error=google_signin_failed`, 302);
    }
  };

  return { start, callback };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please sign in again.");
  }
  return user;
}
