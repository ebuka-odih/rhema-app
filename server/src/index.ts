import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.js";

const app = new Hono();

app.use("*", cors({
    origin: "*", // Adjust this in production
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
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
