import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/store/authStore";

export default function WelcomeBanner() {
  const { user } = useAuth();

  const firstName = user?.fullName?.split(" ")[0] ?? "Learner";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-right from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
      <div className="absolute right-6 top-6 opacity-20">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10 max-w-2xl space-y-5">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">👋 Welcome Back, {firstName}</h1>

          <p className="text-lg text-blue-100">
            Continue your learning journey and become a better developer every
            day.
          </p>
        </div>

        <Button size="lg" variant="secondary" className="gap-2">
          Continue Learning
          <ArrowRight size={18} />
        </Button>
      </div>
    </section>
  );
}
