import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { sendEmail } from "../email/send-email";
import { Session } from "../lib/auth-client";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    nextCookies(),
    admin(),
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256", // Use an asymmetric algorithm
        },
      },
      jwt: {
        // Define what data goes into the token
        definePayload: ({ user }) => {
          return {
            email: user.email,
            role: user.role,
          };
        },
        // IMPORTANT: The issuer URL must be the public URL of your Next.js app
        issuer:
          process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.BETTER_AUTH_URL ||
          "http://localhost:3000",
        audience: "api://my-java-backend", // A unique identifier for your Java API
      },
    }),
  ],
  database: createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set("callbackURL", "/choose-role");
      url = verificationUrl.toString();
      await sendEmail(url, user as Session);
    },
  },
});
