import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "../utils/toast";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  image_urls?: string[];
  user_id?: string;
  available?: boolean;
}

export default function Profile() {
  const { user, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort annonsen?")) return;

    try {
      await api.delete(`/properties/${id}`);

      setProperties((prev) => prev.filter((p) => p.id !== id));
      notifySuccess("Annonsen togs bort.");
    } catch (err: unknown) {
      console.error("Delete error:", err);
      notifyError("Kunde inte ta bort annonsen.");
    }
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const { data } = await api.get("/properties/mine");
        setProperties(data);
      } catch (err: unknown) {
        console.error("Error fetching properties:", err);
        notifyError("Kunde inte hämta dina annonser.");
      } finally {
        setLoadingProperties(false);
      }
    })();
  }, [user]);

  if (loading) return <p className="text-center mt-10">Laddar användare...</p>;
  if (!user) return <p className="text-center mt-10">Du måste vara inloggad.</p>;

  const displayName =
    user.profile?.name ||
    user.email?.split("@")[0] ||
    "Användare";

  const bio = user.profile?.bio || "Ingen bio ännu";

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Välkommen, {displayName}
      </h1>

      {/* Profile info */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-10">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Namn:</span> {displayName}
        </p>
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">E-post:</span> {user.email}
        </p>
        <p className="text-gray-700 mb-4">
          <span className="font-semibold">Bio:</span> {bio}
        </p>

        <button
          onClick={() => navigate("/update-profile")}
          className="px-5 py-2 bg-rose-400 text-white rounded-full hover:bg-rose-500 transition font-medium"
        >
          Redigera profil
        </button>
      </div>

      {/* Properties header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Dina annonser</h2>

        <button
          onClick={() => navigate("/properties/new")}
          className="bg-rose-400 text-white px-5 py-2 rounded-full hover:bg-rose-500 transition font-medium"
        >
          Lägg till ny
        </button>
      </div>

      {/* Properties list */}
      {loadingProperties ? (
        <p className="text-gray-500">Laddar dina annonser...</p>
      ) : properties.length === 0 ? (
        <p className="text-gray-500">Du har inga annonser ännu.</p>
      ) : (
        <div className="grid gap-4">
          {properties.map((p) => {
            const firstImage = p.image_urls?.[0] || null;

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">
                      Ingen bild
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {p.name}
                    </h3>
                    <p className="text-gray-500">{p.location}</p>
                    <p className="text-gray-600 mt-1">
                      {p.price_per_night} SEK / natt
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pr-2">
                  <button
                    onClick={() => navigate(`/properties/edit/${p.id}`)}
                    className="text-rose-500 hover:underline font-medium"
                  >
                    Redigera
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-gray-400 hover:text-red-500 hover:underline font-medium"
                  >
                    Radera
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

