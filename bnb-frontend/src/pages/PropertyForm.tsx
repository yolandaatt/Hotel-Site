import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { notifyError, notifySuccess } from "../utils/toast";
import { uploadImage } from "../utils/upload";

export default function PropertyForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    price_per_night: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return notifyError("Du måste ange en titel.");
    if (!form.location.trim()) return notifyError("Du måste ange en plats.");
    if (!form.price_per_night || Number(form.price_per_night) <= 0)
      return notifyError("Pris måste vara ett positivt tal.");

    if (imageFiles.length === 0 && imageUrls.length === 0)
      return notifyError("Du måste ladda upp minst en bild.");

    setUploading(true);

    try {
      const finalUrls: string[] = [];

      for (const file of imageFiles) {
        const publicUrl = await uploadImage(file);
        finalUrls.push(publicUrl);
      }

      for (const url of imageUrls) {
        if (url.trim() !== "") finalUrls.push(url.trim());
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        price_per_night: Number(form.price_per_night),
        image_urls: finalUrls, 
      };

      await api.post("/properties", payload);

      notifySuccess("Annons skapad!");
      navigate("/me");
    } catch (err) {
      console.error("Fel vid skapande:", err);
      notifyError("Kunde inte skapa annons.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-lato">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
        Skapa ny annons
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Titel */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Titel på boendet"
          className="w-full p-3 rounded-xl border border-gray-300
          focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
          required
        />

        {/* Plats */}
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Plats (t.ex. Stockholm)"
          className="w-full p-3 rounded-xl border border-gray-300
          focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
          required
        />

        {/* Pris */}
        <input
          type="number"
          name="price_per_night"
          value={form.price_per_night}
          onChange={handleChange}
          placeholder="Pris per natt (SEK)"
          className="w-full p-3 rounded-xl border border-gray-300
          focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
          required
        />

        {/* Beskrivning */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Beskrivning av boendet"
          rows={4}
          className="w-full p-3 rounded-xl border border-gray-300
          focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition"
        />

        {/* Filupload */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setImageFiles((prev) => [...prev, ...files]);
          }}
          className="w-full text-gray-700"
        />

        {/* URL-input */}
        <div className="flex gap-2 mt-3">
          <input
            id="urlAdd"
            type="text"
            placeholder="Klistra in bild-URL"
            className="flex-1 p-2 border rounded-xl text-gray-700"
          />
          <button
            type="button"
            className="px-4 bg-rose-400 hover:bg-rose-500 text-white rounded-xl transition"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>("#urlAdd");
              if (!input) return;
              const value = input.value.trim();
              if (value !== "") {
                setImageUrls((prev) => [...prev, value]);
                input.value = "";
              }
            }}
          >
            Lägg till
          </button>
        </div>

        {/* Preview */}
        {(imageFiles.length > 0 || imageUrls.length > 0) && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {imageFiles.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-24 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 px-2 py-1 rounded-full shadow text-xs"
                >
                  ✕
                </button>
              </div>
            ))}

            {imageUrls.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  className="w-full h-24 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 px-2 py-1 rounded-full shadow text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-3 rounded-full text-white font-medium transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-rose-400 hover:bg-rose-500"
          }`}
        >
          {uploading ? "Skapar..." : "Skapa annons"}
        </button>
      </form>
    </div>
  );
}
