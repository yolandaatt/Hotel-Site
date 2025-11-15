import { useState } from "react";
import { useAuth } from "../context/authContext";
import { notifyError, notifySuccess } from "../utils/toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);

      notifySuccess("Välkommen tillbaka!");

      navigate("/me");
    } catch (err: unknown) {
      console.error(err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const resp = (err as { response?: { status?: number } }).response;

        if (resp?.status === 401) {
          notifyError("Fel uppgifter, försök igen.");
          return;
        }
      }

      notifyError("Ett oväntat fel uppstod.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Logga in
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <input
          type="email"
          placeholder="E-postadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="
            border w-full p-3 rounded-xl 
            border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400
            transition
          "
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            border w-full p-3 rounded-xl 
            border-gray-300 
            focus:ring-2 focus:ring-rose-300 focus:border-rose-400
            transition
          "
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="
            bg-rose-400 text-white w-full py-3 rounded-full 
            hover:bg-rose-500 font-medium
            transition disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>
      </form>
    </div>
  );
}
