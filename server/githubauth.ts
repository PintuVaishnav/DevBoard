import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { VerifyCallback } from "passport-oauth2";

// Replace with your GitHub app credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "your-client-id";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "your-client-secret";

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      const user = {
        id: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails?.[0].value || "",
        avatar: profile.photos?.[0].value || "",
        provider: "github",
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));