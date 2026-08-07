import { useRef } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { DURATION } from "@/lib/design-system";
import { useMountAnimation } from "@/lib/motion-gsap";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle({ align = "end" }) {
  const { theme, setTheme } = useTheme();
  const iconRef = useRef(null);

  useMountAnimation(iconRef, [theme], {
    scale: 0.5,
    duration: DURATION.icon / 1000,
  });

  const active = THEMES.find((t) => t.value === theme) ?? THEMES[2];
  const Icon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            aria-label={`Theme: ${active.label}. Change theme`}
          />
        }
      >
        <span key={theme} ref={iconRef} className="flex">
          <Icon className="h-4 w-4" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {THEMES.map(({ value, label, icon: ItemIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ItemIcon className="h-4 w-4" />
              {label}
            </span>
            {theme === value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
