// FEATURE: NextAuth route handler — mounts sign-in/callback/session endpoints

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
