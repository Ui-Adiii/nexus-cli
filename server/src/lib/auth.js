import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { deviceAuthorization } from "better-auth/plugins";
import { client, db } from "./db.js";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  basePath: "/api/auth",

  trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },

  plugins: [
    deviceAuthorization({
      expiresIn: "30m",
      interval: "5s",
    }),
  ],
});
