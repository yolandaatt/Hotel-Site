import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoute } from "./routes/auth";
import { propertyRoute } from "./routes/property";
import { bookingRoute } from "./routes/booking";
import "dotenv/config";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/", (c) => c.text("Bnb API is running"));

app.route("/auth", authRoute);
app.route("/properties", propertyRoute);
app.route("/bookings", bookingRoute);

const port = Number(process.env.PORT) || 3000;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
