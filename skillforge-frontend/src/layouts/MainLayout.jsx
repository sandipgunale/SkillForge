import { Outlet } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
