import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.js";

const app = new Hono();

const defaultDevOrigins = [
    "http://localhost:5173",
    "http://localhost:19006",
    "http://localhost:8081",
];

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const resolvedOrigins =
    allowedOrigins.length > 0
        ? allowedOrigins
        : process.env.NODE_ENV === "production"
            ? []
            : defaultDevOrigins;

app.use("*", cors({
    origin: (origin) => {
        if (!origin) return null;
        return resolvedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
}));

app.on(["POST", "GET"], "/api/auth/**", (c) => {
    return auth.handler(c.req.raw);
});

app.get("/", (c) => {
    return c.text("Auth Server is running!");
});

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};
