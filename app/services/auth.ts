import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { AUTH_BASE_URL } from "./apiConfig";

export const authClient = createAuthClient({
    baseURL: AUTH_BASE_URL,
    plugins: [
        expoClient({
            storage: SecureStore,
        })
    ]
});

export const { signIn, signUp, signOut, useSession } = authClient;
