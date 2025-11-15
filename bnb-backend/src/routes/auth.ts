import { Hono } from "hono";
import { supabase } from "../config/supabase";
import { setCookie, deleteCookie } from "hono/cookie";
import { requireAuth } from "../middleware/auth";

export const authRoute = new Hono();

const cookieConfig = {
  httpOnly: true,
  sameSite: "Lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

authRoute.post("/register", async (c) => {
  const { email, password, name } = await c.req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ user: data.user });
});

authRoute.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return c.json({ error: error?.message ?? "Login failed" }, 400);
  }

  const session = data.session;

  setCookie(c, "sb-access-token", session.access_token, {
    ...cookieConfig,
    maxAge: session.expires_in,
  });

  if (session.refresh_token) {
    setCookie(c, "sb-refresh-token", session.refresh_token, {
      ...cookieConfig,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return c.json({ ok: true });
});

authRoute.post("/logout", async (c) => {
  deleteCookie(c, "sb-access-token", cookieConfig);
  deleteCookie(c, "sb-refresh-token", cookieConfig);
  return c.json({ ok: true });
});

authRoute.get("/me", requireAuth, async (c) => {
  const user = c.get("user");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, bio")
    .eq("id", user.id)
    .maybeSingle();

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      profile,
    },
  });
});

authRoute.put("/update-profile", requireAuth, async (c) => {
  const user = c.get("user");
  const { name, bio } = await c.req.json();

  const { data, error } = await supabase
    .from("profiles")
    .update({ name, bio })
    .eq("id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ profile: data });
});
