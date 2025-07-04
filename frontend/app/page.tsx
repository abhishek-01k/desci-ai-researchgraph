import HeroSection from "@/components/sections/HeroSection";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import HowItWorks from "@/components/sections/HowItWorks";
import ResearchDashboard from "@/components/sections/ResearchDashboard";
import KnowledgeGraphDemo from "@/components/sections/KnowledgeGraphDemo";
import Community from "@/components/sections/Community";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      <div className="w-full">
        <HeroSection />
        <div className="space-y-24 pb-24">
          <FeaturesGrid />
          <ResearchDashboard />
          <KnowledgeGraphDemo />
          <HowItWorks />
          <Community />
        </div>
      </div>
      <Toaster />
    </main>
  );
}