import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Sales from "../pages/Sales";
import Purchases from "../pages/Purchases";
import MainLayout from "../layouts/MainLayout";
import Masters from "../pages/Masters";
import Reports from "../pages/Reports";
import Analytics from "../pages/Analytics";
import Alerts from "../pages/Alerts";
import Invoice from "../pages/Invoice";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/masters" element={<Masters />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} /> ✅
          <Route path="/analytics" element={<Analytics />} /> ✅
          <Route path="/alerts" element={<Alerts />} /> ✅
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/invoice/:id" element={<Invoice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
