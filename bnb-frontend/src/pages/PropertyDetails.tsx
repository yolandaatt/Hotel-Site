import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { notifyError } from "../utils/toast";

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

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err);
        notifyError("Kunde inte ladda boendet.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  const images = property.image_urls ?? [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;

  const nextImage = () => {
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 font-lato">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-rose-500 hover:underline mb-6 block"
      >
        ← Tillbaka
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Image / Carousel */}
        {hasImages ? (
          <div className="relative w-full h-64">
            <img
              src={currentImage!}
              alt={property.name}
              className="w-full h-full object-cover"
            />

            {/* Carousel arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                >
                  ›
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500">
            Ingen bild tillgänglig
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {property.name}
          </h1>

          <p className="text-gray-500 mb-2">{property.location}</p>

          <p className="text-lg font-semibold text-gray-700 mb-6">
            {property.price_per_night} SEK / natt
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            {property.description}
          </p>

          {/* Book button */}
          <button
            onClick={() => navigate(`/book/${property.id}`)}
            className="
              w-full bg-rose-400 text-white py-3 rounded-full
              font-medium text-lg hover:bg-rose-500 transition
            "
          >
            Boka nu
          </button>
        </div>
      </div>
    </div>
  );
}

