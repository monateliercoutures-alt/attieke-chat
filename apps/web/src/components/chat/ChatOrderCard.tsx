'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ORDER_STATUS_SEQUENCE, type Locale, type Order } from '@attieke-chat/shared';
import type { ChatDictionary, CommonDictionary } from '@/lib/i18n';
import { formatDateTime, formatPriceYuan } from '@/lib/i18n';

interface ChatOrderCardProps {
  order: Order;
  locale: Locale;
  dict: ChatDictionary['orderCard'];
  statusDict: CommonDictionary['orderStatus'];
  isBusy: boolean;
  onConfirmOrder: (orderId: string) => Promise<void>;
  onAdvanceStep: (orderId: string) => Promise<void>;
}

export function ChatOrderCard({
  order,
  locale,
  dict,
  statusDict,
  isBusy,
  onConfirmOrder,
  onAdvanceStep,
}: ChatOrderCardProps): React.JSX.Element {
  const currentStepIdx = ORDER_STATUS_SEQUENCE.indexOf(order.status);
  const isDelivered = order.status === 'delivered';

  return (
    <div className="w-full max-w-md space-y-3">
      {/* Carte 1 : Détails de la commande (fidèle à image-2.png) */}
      <div className="overflow-hidden rounded-2xl border border-brand-ink/10 bg-white p-4 text-brand-ink shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-ink/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green text-xs text-white">
              📋
            </span>
            <h3 className="text-sm font-extrabold text-brand-ink sm:text-base">
              {dict.title}
            </h3>
          </div>
          <span className="rounded-full bg-brand-green-soft px-2.5 py-0.5 text-[11px] font-extrabold text-brand-green">
            {statusDict[order.status]}
          </span>
        </div>

        {/* Liste des produits commandés */}
        <ul className="divide-y divide-brand-ink/10 py-2">
          {order.items.map((item) => (
            <li
              key={`${order.id}-${item.productId}`}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream-subtle">
                  <Image
                    src={item.productImage}
                    alt={item.productName[locale]}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-brand-ink sm:text-sm">
                    {item.productName[locale]}
                  </p>
                  <p className="text-[11px] text-brand-ink-muted">
                    {item.weightKg} kg
                  </p>
                  <p className="text-xs font-extrabold text-brand-green">
                    {formatPriceYuan(item.unitPriceYuan, locale)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-extrabold text-brand-ink">
                × {item.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Totaux */}
        <div className="space-y-1.5 border-t border-brand-ink/10 pt-3 text-xs">
          <div className="flex justify-between text-brand-ink-muted">
            <span>{dict.subtotalLabel}</span>
            <span className="font-bold text-brand-ink">
              {formatPriceYuan(order.subtotalYuan, locale)}
            </span>
          </div>
          <div className="flex justify-between text-brand-ink-muted">
            <span>{dict.shippingFeeLabel}</span>
            <span className="font-bold text-brand-ink">
              {formatPriceYuan(order.shippingFeeYuan, locale)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-green-soft/65 px-3 py-2 text-sm font-extrabold text-brand-green">
            <span>{dict.totalLabel}</span>
            <span className="text-base">
              {formatPriceYuan(order.totalYuan, locale)}
            </span>
          </div>
        </div>

        {/* Adresse de livraison en Chine */}
        <div className="mt-3 rounded-xl bg-brand-cream/70 p-3 text-xs">
          <p className="flex items-center gap-1.5 font-extrabold text-brand-green">
            <span aria-hidden="true">📍</span>
            <span>{dict.shippingAddressTitle}</span>
          </p>
          <p className="mt-1 font-medium text-brand-ink leading-relaxed">
            {order.shippingAddress.province} {order.shippingAddress.city}{' '}
            {order.shippingAddress.district} {order.shippingAddress.streetAddress}
          </p>
          <p className="mt-0.5 text-brand-ink-muted">
            {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
          </p>
        </div>

        {/* Bouton Confirmer la commande ou Simuler l'étape suivante */}
        <div className="mt-3.5 space-y-2">
          {order.status === 'pending' ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onConfirmOrder(order.id)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-brand-green-dark disabled:opacity-60 sm:text-sm"
            >
              <span aria-hidden="true">✓</span>
              <span>
                {isBusy ? dict.confirmingOrder : dict.confirmOrderButton}
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              {!isDelivered && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void onAdvanceStep(order.id)}
                  className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-ink bg-brand-gold px-3 py-2 text-xs font-extrabold text-brand-ink transition-colors hover:bg-brand-gold-hover disabled:opacity-60"
                >
                  <span aria-hidden="true">🚚</span>
                  <span>{dict.advanceStepButton}</span>
                </button>
              )}
              <Link
                href={`/${locale}/orders`}
                className="flex min-h-[40px] items-center justify-center rounded-xl border border-brand-ink/15 bg-brand-cream px-3 py-2 text-xs font-bold text-brand-ink hover:bg-brand-green-soft"
              >
                {dict.viewOrdersLink} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Carte 2 : Frise de suivi des 7 étapes dans le chat (fidèle à image-2.png) */}
      <div className="overflow-hidden rounded-2xl border border-brand-ink/10 bg-white p-4 text-brand-ink shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-ink/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🚚</span>
            <h4 className="text-xs font-extrabold text-brand-ink sm:text-sm">
              {dict.trackingTitle}
            </h4>
          </div>
          <span className="text-[10px] font-medium text-brand-ink-muted">
            {dict.orderNumberLabel}: {order.orderNumber}
          </span>
        </div>

        <ol className="mt-3 space-y-2.5">
          {order.timeline.map((event, idx) => {
            const isStepCompleted = idx < currentStepIdx || isDelivered;
            const isStepCurrent = idx === currentStepIdx && !isDelivered;

            return (
              <li
                key={event.id}
                className={`flex items-start justify-between gap-2.5 rounded-xl px-2.5 py-1.5 text-xs ${
                  isStepCurrent ? 'bg-brand-gold-light' : ''
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                      isStepCompleted
                        ? 'bg-brand-green text-white'
                        : isStepCurrent
                        ? 'bg-brand-gold text-brand-ink'
                        : 'bg-brand-cream-subtle text-brand-ink-muted'
                    }`}
                  >
                    {isStepCompleted ? '✓' : idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`font-bold ${
                        isStepCurrent
                          ? 'text-amber-900'
                          : isStepCompleted
                          ? 'text-brand-ink'
                          : 'text-brand-ink-muted'
                      }`}
                    >
                      {idx + 1}. {statusDict[event.status]}
                    </p>
                    <p className="text-[10px] text-brand-ink-muted truncate">
                      {formatDateTime(event.timestamp, locale)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isStepCompleted
                      ? 'text-brand-green'
                      : isStepCurrent
                      ? 'bg-brand-gold/30 text-amber-900'
                      : 'text-brand-ink-muted'
                  }`}
                >
                  {isStepCompleted
                    ? dict.stepCompleted
                    : isStepCurrent
                    ? dict.stepCurrent
                    : dict.stepUpcoming}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-green-soft/60 px-3 py-2 text-[11px] font-semibold text-brand-green">
          <span aria-hidden="true">ℹ️</span>
          <span>{dict.customsBanner}</span>
        </div>
      </div>
    </div>
  );
}
