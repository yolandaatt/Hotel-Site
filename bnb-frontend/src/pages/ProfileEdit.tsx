import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/authContext";
import { notifyError, notifySuccess } from "../utils/toast";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.profile?.name ?? "",
    bio: user?.profile?.bio ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put("/auth/update-profile", form);
      notifySuccess("Profil uppdaterad!");
      navigate("/me");
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      notifyError("Kunde inte uppdatera profilen.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Redigera profil
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Namn
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full bg-rose-400 text-white py-3 rounded-full 
                     font-medium hover:bg-rose-500 transition"
        >
          Spara ändringar
        </button>
      </form>
    </div>
  );
}
