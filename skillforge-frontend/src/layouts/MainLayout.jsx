import { Outlet } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-screen-2xl px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
