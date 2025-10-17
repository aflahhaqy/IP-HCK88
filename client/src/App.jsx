import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home";
import Register from "./pages/register";
import RegisterStaff from "./pages/registerStaff";
import Login from "./pages/login";
import NearestSellers from "./pages/NearestSellers";
import SellerInventory from "./pages/SellerInventory";
import StaffInventory from "./pages/StaffInventory";
import StaffTransaction from "./pages/StaffTransaction";
import StaffSales from "./pages/StaffSales";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registerStaff" element={<RegisterStaff />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nearest" element={<NearestSellers />} />
        <Route
          path="/seller/:staffId/inventory"
          element={<SellerInventory />}
        />
        <Route path="/staff/inventory" element={<StaffInventory />} />
        <Route path="/staff/transaction" element={<StaffTransaction />} />
        <Route path="/staff/sales" element={<StaffSales />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
