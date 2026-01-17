import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema.js";
import * as dotenv from "dotenv";
import { expo } from "@better-auth/expo";

dotenv.config();

const sqlite = new Database("database.sqlite");
const db = drizzle(sqlite, { schema });

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [
        expo()
    ]
});
