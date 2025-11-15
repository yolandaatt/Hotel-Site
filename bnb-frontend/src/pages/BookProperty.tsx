import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { api } from "../api/api";
import { notifyError } from "../utils/toast";
import TailwindDateRange from "../components/DateRange";

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

  const [checkIn, setCheckIn] = useState<Date | null>(() => new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(() => {
    return new Date(Date.now() + 86400000);
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      if (checkOut <= checkIn) {
        notifyError("Check-out måste vara efter check-in.");
        return;
      }

      await api.post("/bookings", {
        property_id: id,
        check_in_date: checkIn.toISOString(),
        check_out_date: checkOut.toISOString(),
      });

      navigate("/bookings");
    } catch (err) {
      console.error("Booking error:", err);
      notifyError("Kunde inte skapa bokning.");
    } finally {
      setLoading(false);
    }
  }

  if (!property) {
    return <p className="text-center mt-16 text-gray-500">Laddar boende...</p>;
  }

  const firstImage = property.image_urls?.[0] ?? null;

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString("sv-SE") : "Välj datum";

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium"
      >
        ← Tillbaka
      </button>

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

      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        {property.name}
      </h1>

      <p className="text-gray-500 mb-1">{property.location}</p>

      <p className="text-lg font-medium text-gray-700 mb-4">
        {property.price_per_night} SEK / natt
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>

      {/* DATE PICKER */}
      <div className="mb-4 relative" ref={calendarRef}>
        <label className="block text-gray-700 font-medium mb-1">
          Check In – Check Out
        </label>

        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="w-full p-3 rounded-xl border border-gray-300 bg-white text-left"
        >
          {formatDate(checkIn)} – {formatDate(checkOut)}
        </button>

        {showCalendar && (
          <div className="absolute left-0 mt-2 z-50">
            <TailwindDateRange
              startDate={checkIn}
              endDate={checkOut}
              onChange={(from, to) => {
                setCheckIn(from);
                setCheckOut(to);
              }}
              onComplete={() => setShowCalendar(false)}
            />
          </div>
        )}
      </div>

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
