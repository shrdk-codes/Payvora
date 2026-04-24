import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firebaseConfig, authOptions } from "./config";

export default NextAuth({
  adapter: FirestoreAdapter(firebaseConfig),
  providers: [
    GoogleProvider({
      clientId: authOptions.googleClientId,
      clientSecret: authOptions.googleClientSecret,
    }),
  ],
  secret: authOptions.nextAuthSecret,
  callbacks: {
    // This executes after a successful login
    async redirect({ url, baseUrl }) {
      // Directs the user to dashboard.html regardless of where they started
      return `${baseUrl}/dashboard.html`;
    },
  },
});
