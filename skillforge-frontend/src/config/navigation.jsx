import {
  BookOpen,
  Bookmark,
  ClipboardList,
  History,
  LayoutDashboard,
  LayoutPanelLeft,
  Route,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export const ROLE_LABELS = {
  STUDENT: "Learner",
  INSTRUCTOR: "Instructor",
  ADMIN: "Administrator",
};

const baseSections = [
  {
    label: "Learn",
    items: [
      { title: "Learning Workspace", path: ROUTES.WORKSPACE, icon: LayoutPanelLeft },
      { title: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { title: "Resources", path: ROUTES.RESOURCES, icon: BookOpen },
      { title: "Bookmarks", path: ROUTES.BOOKMARKS, icon: Bookmark },
    ],
  },
  {
    label: "Practice",
    items: [
      { title: "Quiz", path: ROUTES.QUIZ_SETUP, icon: ClipboardList },
      { title: "Quiz History", path: ROUTES.QUIZ_HISTORY, icon: History },
      { title: "Learning Paths", path: ROUTES.LEARNING_PATH, icon: Route },
      { title: "Achievements", path: ROUTES.ACHIEVEMENTS, icon: Trophy },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", path: ROUTES.PROFILE, icon: UserRound }],
  },
];

export function getNavigationSections(role) {
  const sections = baseSections.map((section) => ({
    ...section,
    items: [...section.items],
  }));

  if (role === "ADMIN") {
    sections.push({
      label: "Workspace",
      items: [{ title: "Admin Panel", path: ROUTES.ADMIN, icon: ShieldCheck }],
    });
  }

  if (role === "INSTRUCTOR") {
    sections.push({
      label: "Workspace",
      items: [{ title: "Instructor Hub", path: ROUTES.INSTRUCTOR, icon: BookOpen }],
    });
  }

  return sections;
}
