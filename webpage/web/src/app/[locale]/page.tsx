import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { ProductShowcase } from '@/components/product-showcase';
import { Testimonials } from '@/components/testimonials';
import { CallToAction } from '@/components/cta-section';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
