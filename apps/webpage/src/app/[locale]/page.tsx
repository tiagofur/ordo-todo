import { Hero } from "@/components/hero";
import { WhyOrdo } from "@/components/why-ordo";
import { StarFeatures } from "@/components/star-features";
import { Features } from "@/components/features";
import { AIFeatures } from "@/components/ai-features";
import { ProductShowcase } from "@/components/product-showcase";
import { Testimonials } from "@/components/testimonials";
import { BlogPreview } from "@/components/blog-preview";
import { CallToAction } from "@/components/cta-section";

const SHOW_TESTIMONIALS = false;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <WhyOrdo />
      <StarFeatures />
      <Features />
      <AIFeatures />
      <ProductShowcase />
      {/* Testimonios ocultos (owner, 26-oct-2026): son placeholders con texto
          de relleno ("[Espacio reservado…]"). Poner en true cuando haya
          testimonios reales; el componente y las traducciones no se tocan. */}
      {SHOW_TESTIMONIALS && <Testimonials />}
      <BlogPreview />
      <CallToAction />
    </div>
  );
}
