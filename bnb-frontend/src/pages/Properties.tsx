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

  if (loading) return <p className="text-center mt-10">Laddar annonser...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-lato">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Alla boenden
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {properties.map((p) => {
          const img =
            p.image_urls?.[0] ??
            "https://via.placeholder.com/300x200?text=Ingen+bild";

          return (
            <div
              key={p.id}
              className="
                bg-white border border-gray-200 rounded-2xl shadow-sm
                hover:shadow-md hover:-translate-y-1 transition 
                cursor-pointer
              "
              onClick={() => navigate(`/properties/${p.id}`)}
            >
              <img
                src={img}
                alt={p.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {p.name}
                </h2>

                <p className="text-gray-500">{p.location}</p>

                <p className="font-medium text-gray-700 mt-1">
                  {p.price_per_night} kr/natt
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
