import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Templates } from "@/components/landing/templates";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Templates />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
