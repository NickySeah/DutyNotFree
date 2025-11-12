import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"




export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        adminClient()
    ]

})

//authClient has all methods needed for authentication
export const {
    signIn,
    signOut,
    signUp,
    useSession,
    sendVerificationEmail,
} = authClient;

export type Session = typeof authClient.$Infer.Session.user;