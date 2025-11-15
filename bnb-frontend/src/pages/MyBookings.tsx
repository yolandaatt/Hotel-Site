import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "../utils/toast";

interface Booking {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  created_at: string;
  properties?: {
    name: string;
    location: string;
    image_urls?: string[];
  };
}

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [editStatus, setEditStatus] = useState<Record<string, string>>({});

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  async function cancelBooking(id: string) {
    try {
      await api.delete(`/bookings/${id}`);

      setBookings((prev) => prev.filter((b) => b.id !== id));
      notifySuccess("Bokningen avbokades!");
    } catch (err: unknown) {
      console.error("Failed to cancel booking:", err);
      notifyError("Kunde inte avboka bokningen.");
    }
  }

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data } = await api.get("/bookings");
        setBookings(data);
      } catch (err: unknown) {
        console.error("Error fetching bookings:", err);
        notifyError("Kunde inte hämta bokningar.");
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const { data } = await api.get("/bookings/requests");
        setRequests(data);
      } catch (err: unknown) {
        console.error("Error fetching requests:", err);
        notifyError("Kunde inte hämta bokningsförfrågningar.");
      } finally {
        setLoadingRequests(false);
      }
    };

    loadRequests();
  }, []);

  async function saveStatus(id: string) {
    const newStatus = editStatus[id];
    if (!newStatus) return;

    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      notifySuccess("Status uppdaterad!");
    } catch (err: unknown) {
      console.error("Status update error:", err);
      notifyError("Kunde inte uppdatera status.");
    }
  }

  if (loadingBookings || loadingRequests) {
    return <p className="text-center mt-10">Laddar bokningar...</p>;
  }

  const StatusTag = ({ status }: { status: string }) => {
    const color =
      status === "confirmed"
        ? "text-green-700"
        : status === "pending"
        ? "text-yellow-600"
        : "text-red-600";

    return <span className={color}>{status}</span>;
  };

  const ImageBox = ({ src }: { src?: string }) =>
    src ? (
      <img
        src={src}
        className="rounded-2xl w-full h-48 object-cover mb-4"
        alt=""
      />
    ) : (
      <div className="bg-gray-200 rounded-2xl h-48 flex items-center justify-center text-gray-600">
        Ingen bild
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-14 px-4 font-lato">

      {/* USER BOOKINGS */}
      <h1 className="text-4xl font-semibold mb-10 text-center text-gray-800">
        Mina bokningar
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-600 mb-20">
          Du har inga bokningar ännu.
        </p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {bookings.map((b) => {
            const img = b.properties?.image_urls?.[0];

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col"
              >
                <ImageBox src={img} />

                <h2 className="text-xl font-semibold text-gray-800">
                  {b.properties?.name}
                </h2>
                <p className="text-gray-600">{b.properties?.location}</p>

                <p className="mt-2 text-gray-700">
                  <span className="font-medium">Check-in:</span>{" "}
                  {b.check_in_date}
                </p>

                <p className="text-gray-700">
                  <span className="font-medium">Check-out:</span>{" "}
                  {b.check_out_date}
                </p>

                <p className="mt-2 font-semibold text-gray-800">
                  {b.total_price} SEK totalt
                </p>

                <p className="mt-2 font-medium">
                  Status: <StatusTag status={b.status} />
                </p>

                <button
                  onClick={() => navigate(`/properties/${b.property_id}`)}
                  className="mt-5 bg-rose-400 hover:bg-rose-500 transition text-white py-2 rounded-full"
                >
                  Visa boende
                </button>

                <button
                  onClick={() => cancelBooking(b.id)}
                  className="mt-3 bg-red-400 hover:bg-red-500 transition text-white py-2 rounded-full"
                >
                  Avboka
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* HOST REQUESTS */}
      {requests.length > 0 && (
        <>
          <h2 className="text-4xl font-semibold mb-10 text-center text-gray-800">
            Bokningsförfrågningar för dina boenden
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {requests.map((r) => {
              const img = r.properties?.image_urls?.[0];

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6"
                >
                  <ImageBox src={img} />

                  <h3 className="text-xl font-semibold text-gray-800">
                    {r.properties?.name}
                  </h3>
                  <p className="text-gray-600">{r.properties?.location}</p>

                  <p className="mt-2 text-gray-700">
                    <span className="font-medium">Datum:</span>{" "}
                    {r.check_in_date} – {r.check_out_date}
                  </p>

                  <p className="mt-2 font-medium">
                    Status: <StatusTag status={r.status} />
                  </p>

                  {/* Status change */}
                  <div className="mt-4">
                    <label className="block font-medium mb-1 text-gray-800">
                      Ändra status
                    </label>

                    <select
                      value={editStatus[r.id] ?? r.status}
                      onChange={(e) =>
                        setEditStatus((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-xl p-2 w-full focus:ring-2 focus:ring-pink-300 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => saveStatus(r.id)}
                      className="mt-3 bg-rose-400 hover:bg-rose-500 transition text-white py-2 rounded-full w-full"
                    >
                      Spara
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


