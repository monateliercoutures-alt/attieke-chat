import React from 'react';
import type { DeliveryStepMock } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface DeliveryTimelineProps {
  steps: readonly DeliveryStepMock[];
  dict: HomeDictionary['delivery'];
}

export function DeliveryTimeline({
  steps,
  dict,
}: DeliveryTimelineProps): React.JSX.Element {
  return (
    <section
      id="delivery"
      aria-labelledby="delivery-heading"
      className="scroll-mt-20 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Grand bloc vert profond arrondi style section sombre WhatsApp.com */}
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-green p-6 text-white shadow-card sm:rounded-[2.75rem] sm:p-12">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-brand-gold">
                {dict.sectionBadge}
              </span>
              <h2
                id="delivery-heading"
                className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
              >
                {dict.sectionTitle}
              </h2>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                {dict.sectionSubtitle}
              </p>
            </div>

            {/* Pilule Drapeau Côte d'Ivoire -> Drapeau Chine */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span
                role="img"
                aria-label={dict.originFlagAlt}
                className="inline-flex h-7 w-7 overflow-hidden rounded-full border border-white/40"
              >
                <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
                  <rect width="8" height="24" x="0" fill="#F77F00" />
                  <rect width="8" height="24" x="8" fill="#FFFFFF" />
                  <rect width="8" height="24" x="16" fill="#009E60" />
                </svg>
              </span>

              <span className="text-xs font-extrabold text-brand-gold" aria-hidden="true">
                ✈️ ───▸
              </span>

              <span
                role="img"
                aria-label={dict.destinationFlagAlt}
                className="inline-flex h-7 w-7 overflow-hidden rounded-full border border-white/40"
              >
                <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
                  <rect width="24" height="24" fill="#DE2910" />
                  <polygon
                    points="6,4 7.2,7.5 10.8,7.5 7.9,9.6 9,13 6,10.9 3,13 4.1,9.6 1.2,7.5 4.8,7.5"
                    fill="#FFDE00"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Frise verticale sur mobile, horizontale sur ordinateur */}
          <ol className="relative mt-10 flex flex-col gap-6 md:mt-12 md:grid md:grid-cols-5 md:gap-4">
            {steps.map((step, index) => {
              const stepText = dict.steps[step.translationKey];
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <li
                  key={step.id}
                  className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center"
                >
                  {/* Ligne verticale Mobile */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-6 top-12 -bottom-6 w-0.5 md:hidden ${
                        isCompleted
                          ? 'bg-[#25D366]'
                          : 'border-l-2 border-dashed border-white/30'
                      }`}
                    />
                  )}

                  {/* Ligne horizontale Desktop */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`hidden md:block absolute top-6 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] h-0.5 ${
                        isCompleted
                          ? 'bg-[#25D366]'
                          : 'border-t-2 border-dashed border-white/30'
                      }`}
                    />
                  )}

                  {/* Cercle d'étape avec coches WhatsApp ✓✓ */}
                  <div
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-extrabold shadow-sm ${
                      isCompleted
                        ? 'border-[#25D366] bg-[#25D366] text-brand-ink'
                        : isActive
                        ? 'border-brand-gold bg-brand-gold text-brand-ink ring-4 ring-brand-gold/30'
                        : 'border-white/35 bg-white/10 text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="text-xs font-extrabold" aria-hidden="true">
                        ✓✓
                      </span>
                    ) : (
                      <span className="text-sm font-extrabold">
                        {step.stepNumber}
                      </span>
                    )}
                  </div>

                  <div className="pt-0.5 md:mt-3.5">
                    <h3 className="text-sm font-extrabold text-white sm:text-base">
                      {stepText.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/75">
                      {stepText.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Résumé délai en bas */}
          <div className="mt-10 flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-xs font-bold text-brand-gold sm:text-sm">
            <span>⚡ {dict.estimatedSummary}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
