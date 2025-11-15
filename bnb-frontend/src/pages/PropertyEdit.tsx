import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { notifyError, notifySuccess } from "../utils/toast";
import { uploadImage } from "../utils/upload";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  image_urls: string[];
}

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newUrls, setNewUrls] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        notifyError("Kunde inte ladda annons.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      if (!property.name.trim()) return notifyError("Du måste ange en titel.");
      if (!property.location.trim()) return notifyError("Du måste ange en plats.");
      if (property.price_per_night <= 0)
        return notifyError("Pris måste vara ett positivt tal.");

      const updatedImages = [...property.image_urls];

      for (const file of newFiles) {
        const publicUrl = await uploadImage(file);
        updatedImages.push(publicUrl);
      }

      for (const url of newUrls) {
        if (url.trim()) updatedImages.push(url.trim());
      }

      await api.put(`/properties/${id}`, {
        name: property.name,
        description: property.description,
        location: property.location,
        price_per_night: Number(property.price_per_night),
        image_urls: updatedImages,
      });

      notifySuccess("Annons uppdaterad!");
      navigate("/me");
    } catch (err) {
      console.error("Error updating property:", err);
      notifyError("Kunde inte uppdatera annonsen.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Laddar annons...</p>;
  }

  if (!property) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Annonsen kunde inte hittas.
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-lato">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Redigera annons
      </h1>

      <form onSubmit={handleUpdate} className="space-y-6">

        {/* Titel */}
        <input
          type="text"
          value={property.name}
          onChange={(e) => setProperty({ ...property, name: e.target.value })}
          placeholder="Titel på boendet"
          className="w-full p-3 rounded-xl border border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
        />

        {/* Plats */}
        <input
          type="text"
          value={property.location}
          onChange={(e) =>
            setProperty({ ...property, location: e.target.value })
          }
          placeholder="Plats (t.ex. Stockholm)"
          className="w-full p-3 rounded-xl border border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
        />

        {/* Pris */}
        <input
          type="number"
          value={property.price_per_night}
          onChange={(e) =>
            setProperty({
              ...property,
              price_per_night: Number(e.target.value),
            })
          }
          placeholder="Pris per natt (SEK)"
          className="w-full p-3 rounded-xl border border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
        />

        {/* Beskrivning */}
        <textarea
          value={property.description}
          onChange={(e) =>
            setProperty({ ...property, description: e.target.value })
          }
          placeholder="Beskrivning av boendet"
          rows={4}
          className="w-full p-3 rounded-xl border border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
        />

        {/* Nuvarande bilder */}
        <div>
          <p className="text-gray-700 font-medium mb-2">Nuvarande bilder</p>

          <div className="grid grid-cols-3 gap-3">
            {property.image_urls.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  className="w-full h-24 object-cover rounded-xl border"
                />

                <button
                  type="button"
                  onClick={() =>
                    setProperty({
                      ...property,
                      image_urls: property.image_urls.filter(
                        (_, index) => index !== i
                      ),
                    })
                  }
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white
                    text-gray-800 px-2 py-1 rounded-full shadow text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nya filer */}
        <div>
          <p className="text-gray-700 font-medium mb-2">Lägg till nya bilder</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setNewFiles((prev) => [...prev, ...files]);
            }}
            className="w-full text-gray-700"
          />
        </div>

        {/* Nya URLs */}
        <div className="flex gap-2 mt-3">
          <input
            id="urlAdd"
            type="text"
            placeholder="Klistra in bild-URL"
            className="flex-1 p-2 border rounded-xl text-gray-700"
          />
          <button
            type="button"
            className="px-4 bg-rose-400 hover:bg-rose-500 text-white rounded-xl transition"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>("#urlAdd");
              if (!input) return;
              const value = input.value.trim();
              if (value) {
                setNewUrls((prev) => [...prev, value]);
                input.value = "";
              }
            }}
          >
            Lägg till
          </button>
        </div>

        {/* Förhandsvisning */}
        {(newFiles.length > 0 || newUrls.length > 0) && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {newFiles.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-24 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white
                    text-gray-700 px-2 py-1 rounded-full shadow text-xs"
                >
                  ✕
                </button>
              </div>
            ))}

            {newUrls.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  className="w-full h-24 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewUrls((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white
                    text-gray-700 px-2 py-1 rounded-full shadow text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-full bg-rose-400 
            text-white font-medium hover:bg-rose-500 transition"
        >
          Uppdatera annons
        </button>
      </form>
    </div>
  );
}
