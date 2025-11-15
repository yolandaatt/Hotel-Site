import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { notifyError, notifySuccess } from "../utils/toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return notifyError("Du måste ange en e-postadress.");
    if (!password.trim()) return notifyError("Du måste ange ett lösenord.");
    if (password.length < 6)
      return notifyError("Lösenordet måste vara minst 6 tecken.");

    try {
      setLoading(true);
      await register(email, password);
      notifySuccess("Konto skapat! Du kan nu logga in.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      notifyError("Kunde inte skapa konto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Skapa konto
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <input
          type="email"
          className="
            border w-full p-3 rounded-xl 
            border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400
            transition
          "
          placeholder="E-postadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          className="
            border w-full p-3 rounded-xl 
            border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400
            transition
          "
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            bg-rose-400 text-white w-full py-3 rounded-full 
            hover:bg-rose-500 font-medium transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Skapar konto..." : "Registrera"}
        </button>
      </form>
    </div>
  );
}
