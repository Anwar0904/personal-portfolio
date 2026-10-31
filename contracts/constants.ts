export const Session = {
  cookieName: "portfolio_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  googleAuth: "/api/oauth/google",
  googleCallback: "/api/oauth/google/callback",
} as const;
