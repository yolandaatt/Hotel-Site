import { Hono } from "hono";
import { supabase } from "../config/supabase";
import { requireAuth } from "../middleware/auth";

export const propertyRoute = new Hono();

const normalizeImages = (input: any): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(x => typeof x === "string" && x.trim() !== "").map(x => x.trim());
  if (typeof input === "string" && input.trim() !== "") return [input.trim()];
  return [];
};

propertyRoute.get("/", async (c) => {
  const destination = c.req.query("destination")?.toLowerCase() ?? "";

  let query = supabase
    .from("properties")
    .select("id, name, location, price_per_night, image_urls");

  if (destination) {
    query = query.or(
      `name.ilike.%${destination}%,location.ilike.%${destination}%`
    );
  }

  const { data, error } = await query;

  return c.json(
    (data ?? []).map((p) => ({
      ...p,
      image_urls: normalizeImages(p.image_urls),
    }))
  );
});


propertyRoute.get("/mine", requireAuth, async (c) => {
  const user = c.get("user");

  const { data } = await supabase
    .from("properties")
    .select("id, name, location, price_per_night, image_urls")
    .eq("user_id", user.id);

  return c.json(
    (data ?? []).map((p) => ({
      ...p,
      image_urls: normalizeImages(p.image_urls),
    }))
  );
});


propertyRoute.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const payload = {
    name: body.name?.trim(),
    description: body.description?.trim(),
    location: body.location?.trim(),
    price_per_night: Number(body.price_per_night),
    available: true,
    image_urls: normalizeImages(body.image_urls),
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("properties")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({
    ...data,
    image_urls: normalizeImages(data.image_urls),
  });
});

propertyRoute.get("/:id", async (c) => {
  const { id } = c.req.param();

  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return c.json({ error: "Property not found" }, 404);
  }

  return c.json({
    ...data,
    image_urls: normalizeImages(data.image_urls),
  });
});

propertyRoute.put("/:id", requireAuth, async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  const body = await c.req.json();

  const { data: existing, error: fetchErr } = await supabase
    .from("properties")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !existing) {
    return c.json({ error: "Property not found" }, 404);
  }

  if (existing.user_id !== user.id) {
    return c.json({ error: "Not authorized" }, 403);
  }

  const updated = {
    name: body.name?.trim(),
    description: body.description?.trim(),
    location: body.location?.trim(),
    price_per_night: Number(body.price_per_night),
    available: body.available ?? true,
    image_urls: normalizeImages(body.image_urls),
  };

  const { data, error } = await supabase
    .from("properties")
    .update(updated)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error || !data) {
    return c.json({ error: error?.message ?? "Update failed" }, 400);
  }

  return c.json({
    ...data,
    image_urls: normalizeImages(data.image_urls),
  });
});

propertyRoute.delete("/:id", requireAuth, async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");

  const { data: existing } = await supabase
    .from("properties")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return c.json({ error: "Property not found" }, 404);
  }

  if (existing.user_id !== user.id) {
    return c.json({ error: "Not authorized" }, 403);
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id);

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ message: "Property deleted successfully" });
});
