import React from 'react';
import type { HomeDictionary } from '@/data/mock/home';

interface HowItWorksProps {
  dict: HomeDictionary['howItWorks'];
}

export function HowItWorks({ dict }: HowItWorksProps): React.JSX.Element {
  const steps: ReadonlyArray<{
    number: number;
    key: 'chat' | 'confirm' | 'receive';
    stepLabel: string;
    title: string;
    description: string;
    bubbleSample: string;
    bubbleTime: string;
    bubbleOutgoing: boolean;
  }> = [
    {
      number: 1,
      key: 'chat',
      stepLabel: dict.steps.chat.stepLabel,
      title: dict.steps.chat.title,
      description: dict.steps.chat.description,
      bubbleSample: dict.steps.chat.bubbleSample,
      bubbleTime: dict.steps.chat.bubbleTime,
      bubbleOutgoing: true,
    },
    {
      number: 2,
      key: 'confirm',
      stepLabel: dict.steps.confirm.stepLabel,
      title: dict.steps.confirm.title,
      description: dict.steps.confirm.description,
      bubbleSample: dict.steps.confirm.bubbleSample,
      bubbleTime: dict.steps.confirm.bubbleTime,
      bubbleOutgoing: false,
    },
    {
      number: 3,
      key: 'receive',
      stepLabel: dict.steps.receive.stepLabel,
      title: dict.steps.receive.title,
      description: dict.steps.receive.description,
      bubbleSample: dict.steps.receive.bubbleSample,
      bubbleTime: dict.steps.receive.bubbleTime,
      bubbleOutgoing: false,
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
            {dict.sectionBadge}
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl"
          >
            {dict.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-brand-ink-muted sm:text-base">
            {dict.sectionSubtitle}
          </p>
        </div>

        {/* 3 Cartes conversationnelles façon WhatsApp.com */}
        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <li
              key={step.key}
              className="flex flex-col justify-between overflow-hidden rounded-[2rem] border border-brand-ink/10 bg-brand-cream-card shadow-card transition-transform duration-200 hover:-translate-y-1"
            >
              {/* Mini fenêtre de bulle WhatsApp en haut de chaque carte */}
              <div className="bg-brand-cream-subtle p-5 border-b border-brand-ink/5">
                <div
                  className={`rounded-2xl px-4 py-3 text-xs font-medium text-brand-ink shadow-sm ${
                    step.bubbleOutgoing
                      ? 'ml-auto rounded-tr-none bg-brand-green-soft'
                      : 'mr-auto rounded-tl-none bg-white'
                  }`}
                >
                  <p className="leading-relaxed">{step.bubbleSample}</p>
                  <span className="mt-1 block text-right text-[10px] font-bold text-brand-ink-muted">
                    {step.bubbleTime}
                  </span>
                </div>
              </div>

              {/* Corps de l'étape avec icône et description */}
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green text-brand-gold shadow-sm">
                      {step.key === 'chat' && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <path d="M12 2C6.48 2 2 6.04 2 11.02c0 2.38 1.03 4.55 2.72 6.17L3.5 22l5.02-1.32c1.1.34 2.27.52 3.48.52 5.52 0 10-4.04 10-9.02S17.52 2 12 2z" />
                        </svg>
                      )}
                      {step.key === 'confirm' && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <path d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9zm1.7 12.3-2.4-2.4 1.4-1.4 1 1 3.6-3.6 1.4 1.4-5 5z" />
                        </svg>
                      )}
                      {step.key === 'receive' && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3h2.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707V16a1 1 0 0 1-1 1h-1.17a3.001 3.001 0 0 1-5.66 0H9.83a3.001 3.001 0 0 1-5.66 0H3a1 1 0 0 1-1-1V5z" />
                        </svg>
                      )}
                    </span>

                    <span className="text-2xl font-extrabold text-brand-green/25">
                      {step.stepLabel}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-brand-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
