import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { notifyError } from "../utils/toast";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  image_urls?: string[];
}

export default function BookProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error("Property load error:", err);
        notifyError("Kunde inte ladda boendet.");
      }
    };

    loadProperty();
  }, [id]);

  async function handleBooking() {
    try {
      setLoading(true);

      if (!checkIn || !checkOut) {
        notifyError("Du måste välja både check-in och check-out.");
        return;
      }

      if (new Date(checkOut) <= new Date(checkIn)) {
        notifyError("Check-out måste vara efter check-in.");
        return;
      }

      await api.post("/bookings", {
        property_id: id,
        check_in_date: checkIn,
        check_out_date: checkOut,
      });

      navigate("/bookings");
    } catch (err: unknown) {
      console.error("Booking error:", err);

      notifyError("Kunde inte skapa bokning.");
    } finally {
      setLoading(false);
    }
  }

  if (!property) {
    return (
      <p className="text-center mt-16 text-gray-500">
        Laddar boende...
      </p>
    );
  }

  const firstImage = property.image_urls?.[0] ?? null;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-sm rounded-2xl border border-gray-100">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium"
      >
        ← Tillbaka
      </button>

      {/* Image */}
      {firstImage ? (
        <img
          src={firstImage}
          alt={property.name}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />
      ) : (
        <div className="bg-gray-200 h-64 rounded-xl mb-6 flex items-center justify-center text-gray-500">
          Ingen bild tillgänglig
        </div>
      )}

      {/* Property info */}
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        {property.name}
      </h1>

      <p className="text-gray-500 mb-1">{property.location}</p>

      <p className="text-lg font-medium text-gray-700 mb-4">
        {property.price_per_night} SEK / natt
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        {property.description}
      </p>

      {/* Dates */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-rose-300 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-rose-300 outline-none"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleBooking}
        disabled={loading}
        className="
          w-full 
          bg-rose-400 
          text-white 
          py-3 
          mt-6 
          rounded-full 
          text-lg 
          font-medium 
          hover:bg-rose-500 
          transition
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Skapar bokning..." : "Boka nu"}
      </button>
    </div>
  );
}

