import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import TailwindDateRange from "./DateRange";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
  const navigate = useNavigate();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);

  const [destination, setDestination] = useState("");

  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [startDate, setStartDate] = useState<Date | null>(() => new Date());
  const [endDate, setEndDate] = useState<Date | null>(() => {
    return new Date(Date.now() + 86400000);
  });

  const calendarRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }

      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuests(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date | null) =>
    date ? format(date, "d MMM", { locale: sv }) : "Välj datum";

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (destination.trim()) params.append("destination", destination);
    if (startDate) params.append("start", startDate.toISOString());
    if (endDate) params.append("end", endDate.toISOString());

    const guestsTotal = adults + children;
    if (guestsTotal > 0) params.append("guests", String(guestsTotal));

    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col items-center font-lato px-3">
      <h1 className="text-3xl font-bold text-gray-800 drop-shadow mb-6 text-center">
        Boka hotell till bästa pris
      </h1>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 border border-gray-100">

        {/* Destinationsfältet */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium text-sm mb-1">
            Jag vill resa till
          </label>

          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination eller hotell"
            className="w-full p-3 rounded-xl border border-gray-300 text-sm
                       focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          />
        </div>

        {/* DATUM */}
        <div className="mb-4 relative" ref={calendarRef}>
          <label className="block text-gray-700 font-medium text-sm mb-1">
            Datum
          </label>

          <button
            type="button"
            onClick={() => {
              setShowGuests(false);
              setShowCalendar((v) => !v);
            }}
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-left text-sm
                       focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          >
            {formatDate(startDate)} – {formatDate(endDate)}
          </button>

          {showCalendar && (
  <div
    className="
      absolute 
      left-0 
      mt-2 
      z-50 
      bg-white 
      rounded-xl 
      shadow-xl 
      border
    "
  >
    <TailwindDateRange
      startDate={startDate}
      endDate={endDate}
      onChange={(from, to) => {
        setStartDate(from);
        setEndDate(to);
      }}
      onComplete={() => setShowCalendar(false)}
    />
  </div>
)}

        </div>

        {/* GÄSTER */}
        <div className="mb-4 relative" ref={guestRef}>
          <label className="block text-gray-700 font-medium text-sm mb-1">
            Antal rum & gäster
          </label>

          <button
            onClick={() => {
              setShowCalendar(false);
              setShowGuests((v) => !v);
            }}
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-left text-sm
                       focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          >
            {rooms} Rum, {adults} Vuxna
            {children > 0 ? `, ${children} Barn` : ""}
          </button>

          {showGuests && (
            <div className="absolute w-full bg-white border rounded-xl p-4 shadow-lg mt-2 z-20 text-sm">

              <GuestRow
                label="Rum"
                value={rooms}
                onAdd={() => setRooms((v) => v + 1)}
                onRemove={() => setRooms((v) => Math.max(1, v - 1))}
              />

              <GuestRow
                label="Vuxna"
                value={adults}
                onAdd={() => setAdults((v) => v + 1)}
                onRemove={() => setAdults((v) => Math.max(1, v - 1))}
              />

              <GuestRow
                label="Barn"
                value={children}
                onAdd={() => setChildren((v) => v + 1)}
                onRemove={() => setChildren((v) => Math.max(0, v - 1))}
              />

              <button
                onClick={() => setShowGuests(false)}
                className="mt-2 w-full py-2 bg-rose-400 text-white rounded-full 
                           hover:bg-rose-500 transition text-sm"
              >
                Klar
              </button>
            </div>
          )}
        </div>

        {/* SÖK KNAPP */}
        <button
          onClick={handleSearch}
          className="w-full bg-rose-400 py-3 text-white 
                     rounded-full text-base font-semibold
                     hover:bg-rose-500 transition mt-3"
        >
          Sök
        </button>
      </div>
    </div>
  );
}

function GuestRow({
  label,
  value,
  onAdd,
  onRemove,
}: {
  label: string;
  value: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-3">
      <span>{label}</span>
      <div className="flex gap-3">
        <button
          onClick={onRemove}
          className="px-2 py-1 bg-gray-200 rounded-lg"
        >
          -
        </button>
        <span>{value}</span>
        <button
          onClick={onAdd}
          className="px-2 py-1 bg-gray-200 rounded-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
