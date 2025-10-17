import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../helpers/http-client";
import Map from "../components/Map";
import { selectIsAuthenticated, logout } from "../store/authSlice";
import {
  selectUserLocation,
  selectIsUpdatingLocation,
  updateCurrentLocation,
  setUserLocation,
} from "../store/locationSlice";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userLocation = useSelector(selectUserLocation);
  const isUpdatingLocation = useSelector(selectIsUpdatingLocation);

  const [recommendations, setRecommendations] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [products, setProducts] = useState([]);
  const [nearestSellers, setNearestSellers] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setProducts(response.data);
    } catch {
      alert("Failed to fetch products. Please try again.");
    }
  };

  const fetchNearestSellers = async () => {
    try {
      const response = await apiClient.get("/seller/nearest");
      if (response.data.data) {
        setNearestSellers(response.data.data);
        if (response.data.customerLocation) {
          dispatch(setUserLocation(response.data.customerLocation));
        }
      }
    } catch (error) {
      if (error.response?.status !== 400) {
        alert("Failed to fetch nearest sellers. Please try again.");
      }
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const result = await dispatch(updateCurrentLocation()).unwrap();

      await fetchNearestSellers();

      alert(
        `Lokasi berhasil diperbarui!\nLatitude: ${result.lat.toFixed(
          6
        )}\nLongitude: ${result.lng.toFixed(6)}`
      );
    } catch (error) {
      let errorMessage = "Gagal memperbarui lokasi.";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "";


  const mapLocations = nearestSellers.map((seller) => ({
    lat: seller.locationLat,
    lng: seller.locationLng,
    name: seller.staffName,
    email: seller.staffEmail,
    distance: seller.distance,
    staffId: seller.staffId,
  }));

  const fetchRecommendations = async () => {
    try {
      const response = await apiClient.get("/recommendations");

      if (Array.isArray(response.data)) {
        setRecommendations(response.data);
      }
      else if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setTimeOfDay(response.data.timeOfDay || "");
      }
    } catch {
      // Fail silently for recommendations
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    fetchRecommendations();
    fetchProducts();
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchNearestSellers();
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-white text-xl font-semibold">Home</span>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section */}
          <div>
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-gray-300 text-sm mb-2">Introducing:</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Matcha Coffee Latte
                </h1>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Macchiato
                </h1>
                <p className="text-gray-400">Taste the next level fusion</p>
              </div>
              {/* Starbucks Logo Watermark */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 ">
                <img
                  src="https://cms.starbucks.co.id/storage/image/temporary/summernote_image_1648472357.jpg"
                  alt="Starbucks"
                  className="w-64 h-64 object-cover"
                />
              </div>
            </div>

            {/* Our Recommendation */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                OUR RECOMMENDATION
              </h2>
              {timeOfDay && (
                <p className="text-gray-400 text-sm mb-4">
                  Rekomendasi untuk waktu {timeOfDay}
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map((product, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white rounded-full w-24 h-24 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                        {product.imgUrl ? (
                          <img
                            src={product.imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-b from-amber-200 to-amber-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs">{product.price}</p>
                    </div>
                  ))
                ) : (
                  // Loading state
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-400 text-sm">Loading our recommendation...</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {isUpdatingLocation
                  ? "Memperbarui Lokasi..."
                  : "Perbarui Lokasi Saya"}
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/nearest")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
                >
                  Lihat Terdekat
                </button>
              </div>
            </div>
          </div>
          <div className="block">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 h-full">
              <h3 className="text-white text-lg font-semibold mb-4">
                📍 Penjual Terdekat
              </h3>
              {userLocation ? (
                <Map
                  apiKey={MAPTILER_KEY}
                  locations={mapLocations}
                  userLocation={userLocation}
                  onLocation={() => {}}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-xl">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📍</div>
                    <p className="text-gray-400 mb-4">
                      Update lokasi Anda untuk melihat penjual terdekat
                    </p>
                    <button
                      onClick={handleUpdateLocation}
                      disabled={isUpdatingLocation}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                      {isUpdatingLocation ? "Updating..." : "Update Lokasi"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-6">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-gray-800/70 transition duration-300 border border-gray-700/50"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center p-8">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-b from-amber-200 to-amber-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-white text-lg font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description ||
                        "Lmeny journey wheft ci yentast the become incutisa"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold text-lg">
                        Rp {product.price?.toLocaleString("id-ID") || "0"}
                      </span>
                      <button
                        onClick={() => navigate("/nearest")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        See nearest
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">Loading products...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
