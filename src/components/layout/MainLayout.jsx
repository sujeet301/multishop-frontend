import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import QuickViewModal from "../product/QuickViewModal";
import SearchOverlay from "../common/SearchOverlay";
import { useSelector } from "react-redux";

export default function MainLayout() {
  const { cartOpen, searchOpen, quickViewProduct } = useSelector((s) => s.ui);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {cartOpen && <CartDrawer />}
      {searchOpen && <SearchOverlay />}
      {quickViewProduct && <QuickViewModal />}
    </div>
  );
}
