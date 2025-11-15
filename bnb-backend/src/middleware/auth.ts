import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createClient } from "@supabase/supabase-js";

export const requireAuth = async (c: Context, next: Next) => {
  const token = getCookie(c, "sb-access-token");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", data.user);
  c.set("supabase", supabase);

  return next();
};
