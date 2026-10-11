import React from 'react';
import type { TestimonialMock } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface TestimonialsProps {
  testimonials: readonly TestimonialMock[];
  dict: HomeDictionary['testimonials'];
}

export function Testimonials({
  testimonials,
  dict,
}: TestimonialsProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
            {dict.sectionBadge}
          </span>
          <h2
            id="testimonials-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl"
          >
            {dict.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-brand-ink-muted sm:text-base">
            {dict.sectionSubtitle}
          </p>
        </div>

        {/* 3 Avis Clients présentés comme de vraies bulles de discussion WhatsApp */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((item) => {
            const reviewText = dict.items[item.translationKey];
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-[2rem] border border-brand-ink/10 bg-brand-cream-subtle p-5 shadow-card sm:p-6"
              >
                {/* En-tête contact WhatsApp */}
                <div className="flex items-center justify-between gap-3 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-extrabold text-brand-gold shadow-sm"
                    >
                      {item.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-brand-ink sm:text-base">
                        {reviewText.author}
                      </h3>
                      <p className="text-xs font-medium text-brand-ink-muted">
                        {reviewText.city}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-brand-green-soft px-2.5 py-1 text-[11px] font-extrabold text-brand-ink">
                    ✓✓ {dict.verifiedLabel}
                  </span>
                </div>

                {/* Bulle de message blanche avec étoiles et coche */}
                <div className="flex-1 rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                  <div
                    role="img"
                    aria-label={dict.starsAriaLabel}
                    className="flex items-center gap-1 text-brand-gold"
                  >
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <svg
                        key={idx}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="mt-2.5 text-sm leading-relaxed text-brand-ink">
                    {reviewText.quote}
                  </blockquote>

                  <span
                    aria-hidden="true"
                    className="mt-2 block text-right text-[10px] font-bold text-sky-600"
                  >
                    ✓✓
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
