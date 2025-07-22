import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db"; // make sure this path is correct
import { users } from "@shared/schema"; // adjust path if needed
import { eq } from "drizzle-orm"; // if you're using drizzle ORM

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value || "";
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (existingUser.length === 0) {
          await db.insert(users).values({
  id: profile.id,
  email,
  first_name: profile.name?.givenName || "",
  last_name: profile.name?.familyName || "",
  role: "user",
  profile_image_url: profile.photos?.[0].value || "",
  created_at: new Date(),
  updated_at: new Date(),
});

        }

        done(null, {
          id: profile.id,
          email,
          first_name: profile.name?.givenName || "",
          last_name: profile.name?.familyName || "",
          profile_image_url: profile.photos?.[0].value || "",
          role: "user",
        });
      } catch (err) {
        done(err);
      }
    }
  )
);
