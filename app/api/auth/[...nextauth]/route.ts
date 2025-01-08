import { type MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },

    Credentials({
      id: "siwe",
      name: "Sign with Ethereum",
      credentials: {},

      async authorize(credentials, req) {
        const {
          nonce,
          messageAddress,
          messageSignature,
          messageTime,
          ...payload
        } = req?.query as MiniAppWalletAuthSuccessPayload & {
          nonce: string;
          messageAddress: string;
          messageSignature: string;
          messageTime: string;
        };

        // https://docs.world.org/mini-apps/commands/wallet-auth#verifying-the-login
        const res = await verifySiweMessage(payload, nonce)

        if (res.isValid && res?.siweMessageData.address) {
          return {
            id: res.siweMessageData.address,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      return true;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
