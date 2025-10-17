import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../helpers/http-client";
import { selectUser, logout } from "../store/authSlice";
import { toast } from "react-toastify";

export default function StaffInventory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Anda belum login. Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    if (user.role !== "Staff") {
      toast.error(
        `Akses ditolak. Halaman ini hanya untuk Staff. Role Anda: ${user.role}`
      );
      navigate("/");
      return;
    }

    fetchInventory();
    fetchProducts();
    fetchStaffStatus();
  }, [navigate, user]);

  const fetchInventory = async () => {
    try {
      const response = await apiClient.get("/staff/inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Remove duplicates by productId (keep only first occurrence)
      const uniqueInventory = (response.data.data || []).filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.productId === item.productId)
      );

      setInventory(uniqueInventory);
    } catch {
      toast.error("Gagal memuat inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/");
      setProducts(response.data || []);
    } catch {
      toast.error("Gagal memuat daftar produk");
    }
  };

  const fetchStaffStatus = async () => {
    try {
      await apiClient.get("/staff/inventory");
    } catch {
      // Silent fail - status will be fetched on next load
    }
  };

  const handleToggleStatus = async () => {
    try {
      await apiClient.put("/staff/status", {
        isActive: !isActive,
      });
      setIsActive(!isActive);
      toast.success(`Status berjualan ${!isActive ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      toast.error("Gagal mengubah status berjualan");
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung di browser Anda");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await apiClient.put("/staff/location", {
            lat: latitude,
            lng: longitude,
          });

          setLocation({ lat: latitude, lng: longitude });
          toast.success(
            `Lokasi diperbarui! Lat: ${latitude.toFixed(
              6
            )}, Lng: ${longitude.toFixed(6)}`
          );
        } catch {
          toast.error("Gagal memperbarui lokasi");
        }
      },
      () => {
        toast.error("Gagal mendapatkan lokasi Anda");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await apiClient.put(`/staff/inventory/${productId}`, {
        stock: parseInt(newStock),
      });

      // Update local state
      setInventory((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, availableStock: parseInt(newStock) }
            : item
        )
      );
    } catch {
      toast.error("Gagal memperbarui stok");
    }
  };

  const handleBulkUpdate = async () => {
    setIsSaving(true);
    try {
      const items = inventory.map((item) => ({
        productId: item.productId,
        stock: item.availableStock,
      }));

      await apiClient.post("/staff/inventory/bulk", { items });
      toast.success("Semua stok berhasil diperbarui!");
      fetchInventory();
    } catch {
      toast.error("Gagal memperbarui stok");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async (product) => {
    // Check if product already in inventory
    const existing = inventory.find((item) => item.productId === product.id);
    if (existing) {
      toast.warning("Produk sudah ada di inventory");
      return;
    }

    try {
      // Save to backend immediately with stock 0
      await apiClient.put(`/staff/inventory/${product.id}`, {
        stock: 0,
      });

      // Add to local state
      setInventory([
        ...inventory,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          availableStock: 0,
        },
      ]);
    } catch {
      toast.error("Gagal menambahkan produk ke inventory");
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus "${productName}" dari inventory?`
    );

    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/staff/inventory/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Remove from local state
      setInventory((prev) =>
        prev.filter((item) => item.productId !== productId)
      );

      toast.success(`"${productName}" berhasil dihapus dari inventory`);
    } catch {
      toast.error("Gagal menghapus produk dari inventory");
    }
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
              <span className="text-white text-xl font-semibold">
                📦 Inventory Management
              </span>
              <div className="hidden md:flex gap-4">
                <button
                  onClick={() => navigate("/staff/inventory")}
                  className="text-green-400 font-medium"
                >
                  Inventory
                </button>
                <button
                  onClick={() => navigate("/staff/transaction")}
                  className="text-gray-400 hover:text-white transition"
                >
                  POS
                </button>
                <button
                  onClick={() => navigate("/staff/sales")}
                  className="text-gray-400 hover:text-white transition"
                >
                  Sales
                </button>
              </div>
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
        {/* Status Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Status Berjualan
              </h2>
              <p className="text-gray-400">
                {isActive
                  ? "🟢 Aktif - Customer dapat melihat lokasi Anda"
                  : "⚫ Nonaktif - Customer tidak dapat melihat Anda"}
              </p>
              {location.lat && location.lng && (
                <p className="text-gray-500 text-sm mt-1">
                  Lokasi: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleToggleStatus}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isActive ? "Selesai Berjualan" : "Mulai Berjualan"}
              </button>
              <button
                onClick={handleUpdateLocation}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                📍 Update Lokasi
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Stok Hari Ini</h2>
            <button
              onClick={handleBulkUpdate}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Semua"}
            </button>
          </div>

          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                Belum ada produk di inventory
              </p>
              <p className="text-gray-500 text-sm">
                Tambahkan produk dari daftar di bawah
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.inventoryId || `product-${item.productId}`}
                  className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">☕</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {item.productName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Rp {item.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateStock(
                          item.productId,
                          Math.max(0, item.availableStock - 1)
                        )
                      }
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.availableStock}
                      onChange={(e) =>
                        handleUpdateStock(item.productId, e.target.value)
                      }
                      className="flex-1 bg-gray-800 text-white text-center text-xl font-semibold py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500"
                      min="0"
                    />
                    <button
                      onClick={() =>
                        handleUpdateStock(
                          item.productId,
                          item.availableStock + 1
                        )
                      }
                      className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        item.availableStock === 0
                          ? "text-red-400"
                          : item.availableStock < 5
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {item.availableStock === 0
                        ? "⚠️ Habis"
                        : item.availableStock < 5
                        ? "⚠️ Stok Menipis"
                        : "✓ Tersedia"}
                    </span>
                    <button
                      onClick={() =>
                        handleDeleteProduct(item.productId, item.productName)
                      }
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                      title="Hapus dari inventory"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Products to Add */}
        {products.length > inventory.length && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">
              Tambah Produk ke Inventory
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products
                .filter(
                  (product) =>
                    !inventory.find((item) => item.productId === product.id)
                )
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-4xl">☕</span>
                      )}
                    </div>
                    <h3 className="text-white font-medium text-sm text-center">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-xs text-center mt-1">
                      Klik untuk tambah
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
