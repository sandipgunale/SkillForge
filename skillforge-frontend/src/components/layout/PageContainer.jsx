import { Outlet } from "react-router-dom";

export default function PageContainer() {
  return (
    <main className="flex-1 bg-slate-100 p-8">
      <Outlet />
    </main>
  );
}
