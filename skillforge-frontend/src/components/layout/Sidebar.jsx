import { NavLink } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

const links = [
  {
    title: "Dashboard",
    path: ROUTES.DASHBOARD,
  },
  {
    title: "Resources",
    path: ROUTES.RESOURCES,
  },
  {
    title: "Quiz",
    path: ROUTES.QUIZ,
  },
  {
    title: "Learning Path",
    path: ROUTES.LEARNING_PATH,
  },
  {
    title: "Profile",
    path: ROUTES.PROFILE,
  },
];

export default function Sidebar() {
  return (
    <aside className="min-h-[calc(100vh-64px)] w-64 border-r bg-white">
      <nav className="flex flex-col gap-2 p-5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 transition
              ${isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"}`
            }
          >
            {link.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
