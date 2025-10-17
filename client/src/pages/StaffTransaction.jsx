import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import apiClient from "../helpers/http-client";
import { toast } from "react-toastify";

export default function StaffTransaction() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [qrisData, setQrisData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await apiClient.get("/staff/inventory");
      setInventory(response.data.data || []);
    } catch {
      toast.error("Failed to fetch inventory. Please try again.");
    }
  };

  const addToCart = (item) => {
    const existing = cart.find((c) => c.productId === item.productId);
    if (existing) {
      // Cek stok
      if (existing.quantity >= item.availableStock) {
        toast.warning(`Stok ${item.productName} tidak mencukupi!`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      if (item.availableStock === 0) {
        toast.warning(`${item.productName} habis!`);
        return;
      }
      setCart([
        ...cart,
        {
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: 1,
          maxStock: item.availableStock,
        },
      ]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.maxStock) {
              toast.warning(`Stok maksimal: ${item.maxStock}`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleGenerateQRIS = async () => {
    if (cart.length === 0) {
      toast.warning("Keranjang masih kosong!");
      return;
    }

    setIsGenerating(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await apiClient.post("/staff/transaction", { items });

      setQrisData(response.data.data);
      setCurrentTransaction(response.data.data);
      toast.success("QRIS berhasil di-generate! Tunjukkan QR Code ke customer.");
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Gagal generate QRIS. Periksa stok dan coba lagi."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!currentTransaction) return;

    setIsCheckingStatus(true);
    try {
      const response = await apiClient.get(
        `/staff/transaction/${currentTransaction.transactionId}/status`
      );

      const status = response.data.data.status;

      if (status === "paid" || status === "completed") {
        toast.success("✅ Pembayaran berhasil! Transaction completed.");
        // Reset form
        setCart([]);
        setQrisData(null);
        setCurrentTransaction(null);
        // Refresh inventory
        fetchInventory();
      } else if (status === "expired") {
        toast.error("❌ QRIS sudah expired. Buat transaksi baru.");
        setQrisData(null);
        setCurrentTransaction(null);
      } else {
        toast.info(`Status: ${status}. Menunggu pembayaran...`);
      }
    } catch {
      toast.error("Gagal cek status pembayaran");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCancelTransaction = () => {
    if (confirm("Batalkan transaksi ini?")) {
      setCart([]);
      setQrisData(null);
      setCurrentTransaction(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-white text-xl font-semibold">
                🛒 POS System
              </span>
              <div className="hidden md:flex gap-4">
                <button
                  onClick={() => navigate("/staff/inventory")}
                  className="text-gray-400 hover:text-white transition"
                >
                  Inventory
                </button>
                <button
                  onClick={() => navigate("/staff/transaction")}
                  className="text-green-400 font-medium"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Product Selection */}
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pilih Produk
              </h2>

              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Inventory kosong</p>
                  <button
                    onClick={() => navigate("/staff/inventory")}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Setup Inventory →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {inventory
                    .filter((item) => item.availableStock > 0)
                    .map((item) => (
                      <button
                        key={item.productId}
                        onClick={() => addToCart(item)}
                        disabled={qrisData !== null}
                        className="bg-gray-900/50 hover:bg-gray-900 disabled:bg-gray-900/30 disabled:cursor-not-allowed rounded-xl p-4 border border-gray-700 hover:border-green-500 transition text-left"
                      >
                        <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-4xl">☕</span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">
                          {item.productName}
                        </h3>
                        <p className="text-green-400 text-sm font-medium">
                          Rp {item.price?.toLocaleString("id-ID")}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Stok: {item.availableStock}
                        </p>
                      </button>
                    ))}
                </div>
              )}

              {inventory.filter((item) => item.availableStock === 0).length >
                0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-3">Stok Habis:</p>
                  <div className="flex flex-wrap gap-2">
                    {inventory
                      .filter((item) => item.availableStock === 0)
                      .map((item) => (
                        <span
                          key={item.productId}
                          className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs"
                        >
                          {item.productName}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Cart & Payment */}
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pesanan Customer
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-400">Belum ada item dipilih</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Klik produk di sebelah kiri untuk menambah
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">
                            {item.productName}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Rp {item.price?.toLocaleString("id-ID")} ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            disabled={qrisData !== null}
                            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded font-bold transition"
                          >
                            −
                          </button>
                          <span className="text-white font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            disabled={qrisData !== null}
                            className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 text-white rounded font-bold transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            disabled={qrisData !== null}
                            className="ml-2 w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white rounded font-bold transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-lg">Total:</span>
                      <span className="text-white text-2xl font-bold">
                        Rp {calculateTotal().toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {!qrisData ? (
                    <button
                      onClick={handleGenerateQRIS}
                      disabled={isGenerating}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg transition"
                    >
                      {isGenerating ? "Generating..." : "💳 Generate QRIS"}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* QRIS Display */}
                      <div className="bg-white p-6 rounded-xl">
                        <p className="text-center text-gray-800 font-bold mb-4">
                          Scan QR Code untuk Bayar
                        </p>
                        {qrisData.qrisUrl ? (
                          <img
                            src={qrisData.qrisUrl}
                            alt="QRIS"
                            className="w-full max-w-sm mx-auto"
                          />
                        ) : (
                          <div className="bg-gray-200 aspect-square flex items-center justify-center">
                            <p className="text-gray-600">QRIS Code</p>
                          </div>
                        )}
                        <p className="text-center text-gray-600 text-sm mt-4">
                          Order ID: {qrisData.orderId}
                        </p>
                        <p className="text-center text-red-600 text-xs mt-2">
                          Expired dalam 15 menit
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleCheckStatus}
                          disabled={isCheckingStatus}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                        >
                          {isCheckingStatus ? "Checking..." : "🔄 Cek Status"}
                        </button>
                        <button
                          onClick={handleCancelTransaction}
                          className="px-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                        >
                          ✖ Batal
                        </button>
                      </div>

                      <p className="text-gray-400 text-sm text-center">
                        Klik "Cek Status" setelah customer membayar
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
