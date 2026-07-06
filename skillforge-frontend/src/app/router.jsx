import { createBrowserRouter } from "react-router-dom";

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">SkillForge 🚀</h1>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);
