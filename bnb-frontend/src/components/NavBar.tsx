import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-semibold text-gray-800 tracking-tight hover:text-[#E4A6B0] transition"
        >
          MyHotelSite
        </Link>

        <div className="flex items-center space-x-6">
          {loading && <span className="text-gray-500">Laddar...</span>}

          {!loading && user && (
            <>
              <Link
                to="/me"
                className="text-gray-700 hover:text-[#E4A6B0] transition"
              >
                Mina sidor
              </Link>

              <Link
                to="/bookings"
                className="text-gray-700 hover:text-[#E4A6B0] transition"
              >
                Bokningar
              </Link>

              <button
                onClick={logout}
                className="
                  px-5 py-2 rounded-full border border-[#E4A6B0]
                  text-[#E4A6B0] hover:bg-[#E4A6B0] hover:text-white
                  transition
                "
              >
                Logga ut
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#E4A6B0] transition"
              >
                Logga in
              </Link>

              <Link
                to="/register"
                className="
                  px-5 py-2 rounded-full border border-[#E4A6B0]
                  text-[#E4A6B0] hover:bg-[#E4A6B0] hover:text-white
                  transition
                "
              >
                Registrera
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
