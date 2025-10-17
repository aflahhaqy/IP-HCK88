import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../helpers/http-client";
import Map from "../components/Map";
import { logout } from "../store/authSlice";
import {
  selectUserLocation,
  selectIsUpdatingLocation,
  updateCurrentLocation,
  setUserLocation,
} from "../store/locationSlice";
import { toast } from "react-toastify";

export default function NearestSellers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userLocation = useSelector(selectUserLocation);
  const isUpdatingLocation = useSelector(selectIsUpdatingLocation);

  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // MapTiler API Key
  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "";

  // Prepare locations for map
  const mapLocations = sellers.map(seller => ({
    lat: seller.locationLat,
    lng: seller.locationLng,
    name: seller.staffName,
    email: seller.staffEmail,
    distance: seller.distance,
    staffId: seller.staffId
  }));

  useEffect(() => {
    fetchNearestSellers();
  }, []);

  const fetchNearestSellers = async () => {
    try {
      const response = await apiClient.get("/seller/nearest");
      setSellers(response.data.data || []);
      // Update user location ke Redux dari response
      if (response.data.customerLocation) {
        dispatch(setUserLocation(response.data.customerLocation));
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.warning("Lokasi Anda belum diset. Silakan update lokasi terlebih dahulu.");
      } else {
        toast.error("Failed to fetch nearest sellers. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      // Dispatch Redux action to update location
      await dispatch(updateCurrentLocation()).unwrap();

      toast.success("Lokasi berhasil diperbarui!");
      // Refresh sellers
      fetchNearestSellers();
    } catch (error) {
      let errorMessage = "Gagal memperbarui lokasi.";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleViewInventory = (staffId) => {
    navigate(`/seller/${staffId}/inventory`);
  };

  

  const handleLogout = () => {
    // Dispatch Redux logout action
    dispatch(logout());
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-white transition"
              >
                ← Back
              </button>
              <span className="text-white text-xl font-semibold">
                🗺️ Penjual Terdekat
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Temukan Penjual Kopi Keliling
              </h1>
              {userLocation && (
                <p className="text-gray-400 text-sm">
                  📍 Lokasi Anda: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
            <button
              onClick={handleUpdateLocation}
              disabled={isUpdatingLocation}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition whitespace-nowrap"
            >
              {isUpdatingLocation ? "Updating..." : "📍 Update Lokasi"}
            </button>
          </div>
        </div>

        {/* Content */}
        {!userLocation ? (
          // No location set yet
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Lokasi Belum Diset
            </h2>
            <p className="text-gray-400 mb-6">
              Kami perlu lokasi Anda untuk menampilkan penjual terdekat
            </p>
            <button
              onClick={handleUpdateLocation}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Izinkan Akses Lokasi
            </button>
          </div>
        ) : sellers.length === 0 ? (
          // No active sellers
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Tidak Ada Penjual Aktif
            </h2>
            <p className="text-gray-400 mb-6">
              Saat ini tidak ada penjual yang sedang berjualan di sekitar Anda.
              <br />
              Coba lagi nanti atau update lokasi Anda.
            </p>
            <button
              onClick={fetchNearestSellers}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              🔄 Refresh
            </button>
          </div>
        ) : (
          // Map and sellers list
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Section - 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 h-full">
                <h2 className="text-white text-xl font-bold mb-4">
                  🗺️ Peta Penjual Terdekat
                </h2>
                <div className="h-[600px]">
                  <Map
                    apiKey={MAPTILER_KEY}
                    locations={mapLocations}
                    userLocation={userLocation}
                    onLocation={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Sellers List - 1/3 width on large screens, scrollable */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
                <h2 className="text-white text-xl font-bold mb-4">
                  📋 Daftar Penjual ({sellers.length})
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {sellers.map((seller) => (
                    <div
                      key={seller.staffId}
                      className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition"
                    >
                      {/* Seller Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">☕</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">
                            {seller.staffName || "Penjual Kopi"}
                          </h3>
                          <p className="text-gray-400 text-xs truncate">
                            {seller.staffEmail}
                          </p>
                        </div>
                        <span className="inline-block px-2 py-1 bg-green-600/20 rounded-full text-green-400 text-xs font-medium flex-shrink-0">
                          🟢 Aktif
                        </span>
                      </div>

                      {/* Distance */}
                      <div className="bg-gray-800/50 rounded-lg py-2 px-3 mb-3">
                        <p className="text-gray-400 text-xs">Jarak</p>
                        <p className="text-green-400 text-lg font-bold">
                          {seller.distance < 1
                            ? `${Math.round(seller.distance * 1000)}m`
                            : `${seller.distance.toFixed(1)}km`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewInventory(seller.staffId)}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition"
                        >
                          👀 Lihat Stok
                        </button>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {sellers.length > 0 && (
          <div className="mt-8 bg-blue-900/20 border border-blue-700/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Tips:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Klik "Lihat Stok" untuk melihat produk yang tersedia</li>
                  <li>• Klik "Buka Maps" untuk mendapat arah ke lokasi penjual</li>
                  <li>• Klik marker di map untuk info detail penjual</li>
                  <li>
                    • Pembayaran dilakukan langsung ke penjual menggunakan QRIS
                  </li>
                  <li>• Update lokasi Anda untuk hasil yang lebih akurat</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
