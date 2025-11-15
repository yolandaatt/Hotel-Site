import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBox from "../components/SearchBox";
import { notifyError } from "../utils/toast";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  image_urls?: string[];
}

export default function Home() {
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  function getValidImage(imgs?: string[]): string {
    if (!imgs || imgs.length === 0) {
      return "https://via.placeholder.com/600x400?text=Ingen+bild";
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

    return "https://via.placeholder.com/600x400?text=Ingen+bild";
  }

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const { data } = await api.get(`/properties?${params.toString()}`);

        setFiltered(data);
      } catch (err) {
        console.error("Error loading properties:", err);
        notifyError("Kunde inte ladda boenden.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.search]);

  if (loading) {
    return (
      <p className="text-center mt-16 text-gray-500 text-lg">
        Laddar boenden...
      </p>
    );
  }

  return (
    <div className="w-full">

      {/* HERO + SEARCHBOX */}
      <div
        className="w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/your-image-here.jpg')" }}
      >
        <SearchBox />
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-semibold text-gray-800 mt-10 mb-8 text-center">
        {location.search ? "Sökresultat" : "Alla boenden"}
      </h1>

      {/* RESULTS */}
      <div className="max-w-5xl mx-auto p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">
            Inga boenden matchar din sökning.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((p) => {
              const img = getValidImage(p.image_urls);

              return (
                <div
                  key={p.id}
                  onClick={() =>
                    navigate(`/properties/${p.id}${location.search}`)
                  }
                  className="
                    bg-white 
                    border border-gray-100 
                    rounded-2xl 
                    shadow-sm 
                    hover:shadow-md 
                    transition 
                    cursor-pointer 
                    overflow-hidden
                  "
                >
                  {/* Image */}
                  <img
                    src={img}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/600x400?text=Ingen+bild";
                    }}
                    alt={p.name}
                    className="w-full h-52 object-cover"
                  />

                  <div className="p-5">
                    <h2 className="text-xl font-medium text-gray-800 mb-1">
                      {p.name}
                    </h2>

                    <p className="text-gray-500 mb-2">{p.location}</p>

                    <p className="text-gray-700 font-semibold">
                      {p.price_per_night} SEK / natt
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/properties/${p.id}${location.search}`);
                      }}
                      className="
                        mt-4 
                        w-full 
                        bg-rose-400 
                        text-white 
                        py-2.5 
                        rounded-full 
                        font-medium 
                        hover:bg-rose-500 
                        transition
                      "
                    >
                      Visa detaljer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
