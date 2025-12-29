'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const t = useTranslations('Testimonials');

  const testimonials = [
    { id: 'user1', avatar: 'MG', rating: 5, color: '#06B6D4' },
    { id: 'user2', avatar: 'CR', rating: 5, color: '#EC4899' },
    { id: 'user3', avatar: 'AM', rating: 5, color: '#F97316' },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden section-alt">
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-24 h-24 border-4 border-[#10B981]/10 rounded-full" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border-4 border-[#06B6D4]/10 rotate-45" />

      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981] text-white mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full p-8 rounded-2xl bg-card border-2 border-border hover:border-[#10B981]/50 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute -top-4 right-8">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: testimonial.color }}
                  >
                    <Quote className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#F97316] fill-[#F97316]" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/90 leading-relaxed mb-6">
                  &ldquo;{t(`items.${testimonial.id}.content`)}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: testimonial.color }}
                  >
                    <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t(`items.${testimonial.id}.name`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`items.${testimonial.id}.role`)} @ {t(`items.${testimonial.id}.company`)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
