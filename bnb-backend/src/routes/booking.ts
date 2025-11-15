import { Hono } from "hono";
import { supabase } from "../config/supabase";
import { requireAuth } from "../middleware/auth";

export const bookingRoute = new Hono();

bookingRoute.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      property_id,
      check_in_date,
      check_out_date,
      total_price,
      status,
      created_at,
      properties:property_id (
        id,
        name,
        location,
        image_urls
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data ?? []);
});

bookingRoute.get("/requests", requireAuth, async (c) => {
  const user = c.get("user");

  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("user_id", user.id);

  if (!properties || properties.length === 0) {
    return c.json([]);
  }

  const ids = properties.map((p) => p.id);

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      property_id,
      check_in_date,
      check_out_date,
      total_price,
      status,
      created_at,
      properties:property_id (
        id,
        name,
        location,
        image_urls
      )
    `)
    .in("property_id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json((data ?? []).filter((b: any) => b.properties !== null));
});

bookingRoute.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const { property_id, check_in_date, check_out_date } = await c.req.json();

  if (!property_id || !check_in_date || !check_out_date) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const payload = {
    user_id: user.id,
    property_id,
    check_in_date,
    check_out_date,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

bookingRoute.put("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();

  const { data, error } = await supabase
    .from("bookings")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

bookingRoute.put("/:id/status", requireAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const { status } = await c.req.json();

  const allowed = ["pending", "confirmed", "rejected"];
  if (!allowed.includes(status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, properties(user_id)")
    .eq("id", id)
    .maybeSingle();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.properties.user_id !== user.id) {
    return c.json({ error: "Not authorized" }, 403);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

bookingRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "Booking deleted" });
});

