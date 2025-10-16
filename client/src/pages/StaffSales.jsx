import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import apiClient from "../helpers/http-client";

export default function StaffSales() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await apiClient.get("/staff/sales/today");
      setSalesData(response.data);
    } catch {
      alert("Gagal memuat data penjualan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: {
        bg: "bg-green-900/30",
        text: "text-green-400",
        label: "✓ Selesai",
      },
      paid: {
        bg: "bg-blue-900/30",
        text: "text-blue-400",
        label: "💳 Dibayar",
      },
      pending: {
        bg: "bg-yellow-900/30",
        text: "text-yellow-400",
        label: "⏳ Pending",
      },
      expired: {
        bg: "bg-red-900/30",
        text: "text-red-400",
        label: "❌ Expired",
      },
      cancelled: {
        bg: "bg-gray-900/30",
        text: "text-gray-400",
        label: "✖ Dibatal",
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading sales data...</div>
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
                📊 Sales Report
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
                  className="text-gray-400 hover:text-white transition"
                >
                  POS
                </button>
                <button
                  onClick={() => navigate("/staff/sales")}
                  className="text-green-400 font-medium"
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Laporan Penjualan
            </h1>
            <p className="text-gray-400">
              {salesData?.date || new Date().toLocaleDateString("id-ID")}
            </p>
          </div>
          <button
            onClick={fetchSalesData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 border border-green-500/30">
            <p className="text-green-100 text-sm mb-2">Total Pendapatan</p>
            <p className="text-white text-3xl font-bold">
              Rp{" "}
              {salesData?.summary.totalRevenue.toLocaleString("id-ID") || "0"}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Transaksi</p>
            <p className="text-white text-3xl font-bold">
              {salesData?.summary.totalTransactions || 0}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Selesai</p>
            <p className="text-green-400 text-3xl font-bold">
              {salesData?.summary.completedTransactions || 0}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Pending</p>
            <p className="text-yellow-400 text-3xl font-bold">
              {salesData?.summary.pendingTransactions || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Sales */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Penjualan per Produk
            </h2>

            {salesData?.productSales && salesData.productSales.length > 0 ? (
              <div className="space-y-4">
                {salesData.productSales.map((product, index) => (
                  <div
                    key={index}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold">
                        {product.productName}
                      </h3>
                      <span className="text-green-400 font-bold">
                        Rp {product.revenue.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">
                        Terjual: {product.quantitySold} cup
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (product.quantitySold /
                              Math.max(
                                ...salesData.productSales.map(
                                  (p) => p.quantitySold
                                )
                              )) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Belum ada penjualan hari ini</p>
              </div>
            )}
          </div>

          {/* Transaction List */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Riwayat Transaksi
            </h2>

            {salesData?.transactions && salesData.transactions.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {salesData.transactions.map((transaction) => (
                  <div
                    key={transaction.transactionId}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-semibold">
                          #
                          {transaction.orderId?.split("-").slice(-1)[0] ||
                            transaction.transactionId}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(transaction.createdAt).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {transaction.itemCount} item
                      </span>
                      <span className="text-green-400 font-bold">
                        Rp {transaction.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {transaction.paidAt && (
                      <p className="text-gray-500 text-xs mt-2">
                        Dibayar:{" "}
                        {new Date(transaction.paidAt).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Belum ada transaksi hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        {salesData?.summary && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Statistik</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">
                  Rata-rata Transaksi
                </p>
                <p className="text-white text-xl font-bold">
                  Rp{" "}
                  {salesData.summary.completedTransactions > 0
                    ? Math.round(
                        salesData.summary.totalRevenue /
                          salesData.summary.completedTransactions
                      ).toLocaleString("id-ID")
                    : "0"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                <p className="text-white text-xl font-bold">
                  {salesData.summary.totalTransactions > 0
                    ? Math.round(
                        (salesData.summary.completedTransactions /
                          salesData.summary.totalTransactions) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Paid</p>
                <p className="text-blue-400 text-xl font-bold">
                  {salesData.summary.paidTransactions || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Total Items Sold</p>
                <p className="text-green-400 text-xl font-bold">
                  {salesData.productSales?.reduce(
                    (sum, p) => sum + p.quantitySold,
                    0
                  ) || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
