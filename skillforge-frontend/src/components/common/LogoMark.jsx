import { cn } from "@/lib/utils";

/**
 * LogoMark — the SkillForge brand mark (theme-aware asset pair).
 * Purely decorative (alt=""), sized via className.
 */
export default function LogoMark({ className }) {
  return (
    <>
      <img
        src="/skillforge_logo_Dark.png"
        alt=""
        aria-hidden="true"
        className={cn("block object-contain dark:hidden", className)}
      />
      <img
        src="/skillforge_logo_Dark.png"
        alt=""
        aria-hidden="true"
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}