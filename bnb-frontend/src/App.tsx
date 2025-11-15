import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.tsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetails from "./pages/PropertyDetails.tsx";

import Profile from "./pages/Profile.tsx";
import ProfileEdit from "./pages/ProfileEdit.tsx";

import Properties from "./pages/Properties.tsx";
import PropertyForm from "./pages/PropertyForm.tsx";
import PropertyEdit from "./pages/PropertyEdit.tsx";

import MyBookings from "./pages/MyBookings.tsx";
import BookProperty from "./pages/BookProperty.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <div className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/update-profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/properties/edit/:id" element={<ProtectedRoute><PropertyEdit /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<PropertyDetails />} />

            <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/book/:id" element={<ProtectedRoute><BookProperty /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
