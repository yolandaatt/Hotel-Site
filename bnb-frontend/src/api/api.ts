import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    
    if (!error.response) {
      console.error("Servern svarar inte:", error);
      return Promise.reject({
        message: "Serverfel. Försök igen senare.",
      });
    }

    return Promise.reject(error);
  }
);
