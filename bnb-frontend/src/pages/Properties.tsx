import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  image_urls?: string[];
}

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function getValidImage(imgs?: string[]): string {
    if (!imgs || imgs.length === 0) {
      return "https://via.placeholder.com/400x300?text=Ingen+bild";
    }

    for (const img of imgs) {
      if (!img) continue;

      if (img.startsWith("data:image")) return img;

      try {
        const u = new URL(img);
        if (u.protocol === "http:" || u.protocol === "https:") return img;
      } catch {
        continue;
      }
    }

    return "https://via.placeholder.com/400x300?text=Ingen+bild";
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/properties");
        setProperties(data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Laddar annonser...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-lato">
      <h1 className="text-3xl font-semibold text-gray-800 mb-10 text-center">
        Alla boenden
      </h1>

      {properties.length === 0 ? (
        <p className="text-center text-gray-600">Inga boenden hittades.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => {
            const img = getValidImage(p.image_urls);

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/properties/${p.id}`)}
                className="
                  bg-white border border-gray-200 rounded-3xl shadow-sm 
                  hover:shadow-md hover:-translate-y-1 transition cursor-pointer
                  overflow-hidden
                "
              >
                <img
                  src={img}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x300?text=Ingen+bild";
                  }}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {p.name}
                  </h2>

                  <p className="text-gray-500">{p.location}</p>

                  <p className="font-medium text-gray-700 mt-2">
                    {p.price_per_night} SEK / natt
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
