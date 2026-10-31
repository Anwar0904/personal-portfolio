import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function databaseUrl(): string {
  const value = required("DATABASE_URL");
  if (value && !/^postgres(?:ql)?:\/\//i.test(value)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
  return value;
}

export const env = {
  sessionSecret: required("SESSION_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: databaseUrl(),
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  ownerEmail: process.env.OWNER_EMAIL?.trim().toLowerCase() ?? "",
};
