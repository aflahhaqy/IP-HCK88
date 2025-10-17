import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import apiClient from "../helpers/http-client";

export default function SellerInventory() {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const [seller, setSeller] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerInventory = async () => {
      try {
        const response = await apiClient.get(`/seller/${staffId}/inventory`);
        setSeller(response.data.seller);
        setInventory(response.data.inventory || []);
      } catch {
        alert("Gagal memuat data penjual");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerInventory();
  }, [staffId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-white text-2xl font-bold mb-4">
            Penjual Tidak Ditemukan
          </h2>
          <button
            onClick={() => navigate("/nearest")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            ← Kembali ke Daftar Penjual
          </button>
        </div>
      </div>
    );
  }

  const availableProducts = inventory.filter((item) => item.availableStock > 0);
  const totalProducts = inventory.length;
  const totalAvailable = availableProducts.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate("/nearest")}
                className="text-gray-400 hover:text-white transition"
              >
                ← Kembali
              </button>
              <span className="text-white text-xl font-semibold">
                ☕ Stok Penjual
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
        {/* Seller Info Header */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 mb-8 border border-green-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-5xl">☕</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-white text-3xl font-bold">
                    {seller.name || "Penjual Kopi"}
                  </h1>
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                    🟢 Aktif
                  </span>
                </div>
                <p className="text-green-100 mb-2">{seller.email}</p>
                {seller.distance !== undefined && (
                  <p className="text-white/80 text-sm">
                    📍 Jarak:{" "}
                    {seller.distance < 1
                      ? `${Math.round(seller.distance * 1000)}m`
                      : `${seller.distance.toFixed(1)}km`}{" "}
                    dari Anda
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Produk</p>
                <p className="text-white text-3xl font-bold">{totalProducts}</p>
              </div>
              <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Stok Tersedia</p>
                <p className="text-green-400 text-3xl font-bold">
                  {totalAvailable}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Stok Habis</p>
                <p className="text-red-400 text-3xl font-bold">
                  {totalProducts - totalAvailable}
                </p>
              </div>
              <div className="w-14 h-14 bg-red-600/20 rounded-xl flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {availableProducts.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Stok Sedang Habis
            </h2>
            <p className="text-gray-400 mb-6">
              Saat ini penjual tidak memiliki stok yang tersedia.
              <br />
              Silakan coba lagi nanti atau cari penjual lain.
            </p>
            <button
              onClick={() => navigate("/nearest")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              Cari Penjual Lain
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-2">
                📋 Produk Tersedia
              </h2>
              <p className="text-gray-400">
                Berikut adalah daftar produk yang tersedia saat ini
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProducts.map((item) => (
                <div
                  key={item.productId}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-green-500 transition group"
                >
                  {/* Product Image */}
                  <div className="bg-gradient-to-br from-gray-700 to-gray-900 h-48 flex items-center justify-center relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-7xl group-hover:scale-110 transition">
                        ☕
                      </div>
                    )}
                    {/* Stock Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-green-700 text-sm font-bold shadow-lg">
                        {item.availableStock} tersisa
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-white text-xl font-bold mb-2 group-hover:text-green-400 transition">
                      {item.productName}
                    </h3>

                    {item.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-400 text-xs mb-1">Harga</p>
                      <p className="text-green-400 text-2xl font-bold">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Stock Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Stok</span>
                        <span
                          className={`font-semibold ${
                            item.availableStock > 10
                              ? "text-green-400"
                              : item.availableStock > 5
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.availableStock} unit
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.availableStock > 10
                              ? "bg-green-500"
                              : item.availableStock > 5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (item.availableStock / 20) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                      <p className="text-blue-300 text-xs">
                        💡 Kunjungi penjual untuk membeli produk ini
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">
                Cara Melakukan Pembelian:
              </h3>
              <ol className="text-gray-300 text-sm space-y-2">
                <li>
                  1. Klik "Buka Maps" untuk mendapatkan arah ke lokasi penjual
                </li>
                <li>2. Kunjungi lokasi penjual secara langsung</li>
                <li>
                  3. Beritahu penjual produk yang ingin Anda beli dan jumlahnya
                </li>
                <li>
                  4. Penjual akan membuat pesanan dan menampilkan QRIS untuk
                  pembayaran
                </li>
                <li>5. Scan QRIS dan lakukan pembayaran</li>
                <li>6. Selesai! Nikmati kopi Anda ☕</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/nearest")}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            ← Kembali ke Daftar Penjual
          </button>
        </div>
      </div>
    </div>
  );
}
