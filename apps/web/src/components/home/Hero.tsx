import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface HeroProps {
  locale: Locale;
  dict: HomeDictionary['hero'];
}

export function Hero({ locale, dict }: HeroProps): React.JSX.Element {
  const trustItems: ReadonlyArray<{
    key: string;
    title: string;
    subtitle: string;
  }> = [
    {
      key: 'authentic',
      title: dict.trustBadges.authentic.title,
      subtitle: dict.trustBadges.authentic.subtitle,
    },
    {
      key: 'fresh',
      title: dict.trustBadges.fresh.title,
      subtitle: dict.trustBadges.fresh.subtitle,
    },
    {
      key: 'fast',
      title: dict.trustBadges.fast.title,
      subtitle: dict.trustBadges.fast.subtitle,
    },
    {
      key: 'support',
      title: dict.trustBadges.support.title,
      subtitle: dict.trustBadges.support.subtitle,
    },
  ];

  return (
    <section className="px-3 pt-4 pb-8 sm:px-6 sm:pt-6 lg:px-8">
      {/* Grand conteneur arrondi signature de WhatsApp.com */}
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-green text-white shadow-card sm:rounded-[2.75rem]">
        {/* Fond photographique assombri + dégradé vert profond façon WhatsApp.com */}
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <Image
            src="/images/hero/hero-bowl.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 blur-[2px]"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-green-dark/95 via-brand-green/90 to-brand-green-dark/75"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-10 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-12 lg:gap-8 lg:px-14 lg:py-16">
          {/* Colonne gauche : H1 fort, sous-titre, gros bouton doré pilule */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-brand-gold backdrop-blur-sm sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#25D366]" aria-hidden="true" />
              <span>{dict.badge}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              {dict.title}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {dict.subtitle}
            </p>

            {/* Boutons d'action pilules façon WhatsApp.com */}
            <div className="flex flex-col gap-3.5 pt-2 sm:flex-row sm:items-center">
              <Link
                href={`/${locale}/chat`}
                className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full border-2 border-brand-ink bg-brand-gold px-8 py-4 text-base font-extrabold text-brand-ink shadow-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-white sm:text-lg"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-brand-ink"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.04 2 11.02c0 2.38 1.03 4.55 2.72 6.17L3.5 22l5.02-1.32c1.1.34 2.27.52 3.48.52 5.52 0 10-4.04 10-9.02S17.52 2 12 2z" />
                </svg>
                <span>{dict.ctaPrimary}</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  →
                </span>
              </Link>

              <Link
                href={`/${locale}#products`}
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-brand-ink sm:text-base"
              >
                {dict.ctaSecondary}
              </Link>
            </div>

            {/* 4 Badges de confiance */}
            <dl className="grid grid-cols-2 gap-2.5 pt-3 sm:grid-cols-4">
              {trustItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                >
                  <dt className="truncate text-xs font-extrabold text-brand-gold">
                    ✓ {item.title}
                  </dt>
                  <dd className="mt-0.5 truncate text-[11px] text-white/80">
                    {item.subtitle}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Colonne droite : Photo du bol d'attiéké + Bulles de chat flottantes style WhatsApp.com */}
          <div className="lg:col-span-6">
            <div
              aria-label={dict.chatPreview.ariaLabel}
              className="relative mx-auto max-w-lg"
            >
              {/* Photo principale du bol d'attiéké en arrière-plan de la scène */}
              <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
                <Image
                  src="/images/hero/hero-bowl.jpg"
                  alt={dict.bowlImageAlt}
                  fill
                  priority
                  sizes="(max-width: 640px) 95vw, (max-width: 1024px) 60vw, 520px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                />

                {/* Pilule Vendeur en ligne en haut à gauche sur la photo */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2.5 rounded-full bg-brand-ink/85 px-3.5 py-1.5 text-white backdrop-blur-md border border-white/15">
                  <div className="relative h-7 w-7 overflow-hidden rounded-full border border-brand-gold">
                    <Image
                      src="/images/avatars/vendor.jpg"
                      alt={dict.chatPreview.vendorAvatarAlt}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold leading-tight">
                      {dict.chatPreview.vendorName}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-[#25D366]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden="true" />
                      <span>{dict.chatPreview.vendorStatus}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Superposition de bulles de conversation flottantes façon WhatsApp.com */}
              <div className="relative -mt-16 space-y-2.5 px-2 sm:-mt-24 sm:px-5">
                {/* Bulle Client 1 (vert menthe WhatsApp #D9FDD3) */}
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-none bg-brand-green-soft px-4 py-2.5 text-xs font-medium text-brand-ink shadow-bubble sm:text-sm">
                  <p>{dict.chatPreview.msgCustomer1}</p>
                  <span className="mt-0.5 block text-right text-[10px] font-semibold text-brand-ink-muted">
                    {dict.chatPreview.msgCustomer1Time}{' '}
                    <span className="text-sky-600" aria-hidden="true">
                      ✓✓
                    </span>
                  </span>
                </div>

                {/* Bulle Vendeur 1 (blanche avec réaction emoji ❤️) */}
                <div className="relative mr-auto max-w-[88%] rounded-2xl rounded-tl-none bg-white px-4 py-2.5 text-xs font-medium text-brand-ink shadow-bubble sm:text-sm">
                  <p>{dict.chatPreview.msgVendor1}</p>
                  <span className="mt-0.5 block text-right text-[10px] text-brand-ink-muted">
                    {dict.chatPreview.msgVendor1Time}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2.5 right-3 inline-flex items-center rounded-full border border-brand-cream-subtle bg-white px-1.5 py-0.5 text-xs shadow-sm"
                  >
                    ❤️
                  </span>
                </div>

                {/* Carte Produit Interactive WhatsApp Business */}
                <div className="mr-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-brand-cream-subtle bg-white p-2.5 text-brand-ink shadow-bubble">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src="/images/products/attieke-classic.jpg"
                        alt={dict.chatPreview.productCardImageAlt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-brand-ink sm:text-sm">
                        {dict.chatPreview.productCardTitle}
                      </p>
                      <p className="text-[11px] text-brand-ink-muted">
                        {dict.chatPreview.productCardWeight}
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-brand-green">
                        {dict.chatPreview.productCardPrice}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/chat?product=attieke-classique-1kg`}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-ink bg-brand-gold py-2 text-xs font-extrabold text-brand-ink transition-colors hover:bg-brand-gold-hover"
                  >
                    <span aria-hidden="true">🛒</span>
                    <span>{dict.chatPreview.productCardButton}</span>
                  </Link>
                </div>

                {/* Bulle Client 2 */}
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-none bg-brand-green-soft px-4 py-2.5 text-xs font-medium text-brand-ink shadow-bubble sm:text-sm">
                  <p>{dict.chatPreview.msgCustomer2}</p>
                  <span className="mt-0.5 block text-right text-[10px] font-semibold text-brand-ink-muted">
                    {dict.chatPreview.msgCustomer2Time}{' '}
                    <span className="text-sky-600" aria-hidden="true">
                      ✓✓
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note de bas de Hero façon mention de confidentialité WhatsApp.com */}
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs font-medium text-brand-ink-muted">
        🔒 {dict.directNotice}
      </p>
    </section>
  );
}
