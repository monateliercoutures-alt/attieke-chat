'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ORDER_STATUS_SEQUENCE,
  type Locale,
  type Order,
} from '@attieke-chat/shared';
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
    <div className="w-full max-w-md space-y-2.5">
      {/* Carte 1 : Détails de la commande (bulle spéciale même famille visuelle) */}
      <div className="overflow-hidden rounded-wa-bubble border border-wa-border bg-wa-bubble-in p-3.5 text-wa-text-primary shadow-wa-bubble">
        <div className="flex items-center justify-between border-b border-wa-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-wa-bubble bg-wa-header text-wa-meta text-white">
              📋
            </span>
            <h3 className="text-wa-contact font-medium text-wa-text-primary">
              {dict.title}
            </h3>
          </div>
          <span className="rounded-full bg-wa-accent/15 px-2.5 py-0.5 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent">
            {statusDict[order.status]}
          </span>
        </div>

        {/* Liste des produits commandés */}
        <ul className="divide-y divide-wa-border py-1.5">
          {order.items.map((item) => (
            <li
              key={`${order.id}-${item.productId}`}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-wa-bubble bg-wa-composer">
                  <Image
                    src={item.productImage}
                    alt={item.productName[locale]}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-wa-msg font-medium text-wa-text-primary">
                    {item.productName[locale]}
                  </p>
                  <p className="text-wa-meta text-wa-text-secondary">
                    {item.weightKg} kg
                  </p>
                  <p className="text-wa-preview font-semibold text-wa-dark-green dark:text-wa-accent">
                    {formatPriceYuan(item.unitPriceYuan, locale)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-wa-preview font-semibold text-wa-text-primary">
                × {item.quantity}
              </span>
            </li>
          ))}
        </ul>

        {/* Totaux */}
        <div className="space-y-1 border-t border-wa-border pt-2.5 text-wa-preview">
          <div className="flex justify-between text-wa-text-secondary">
            <span>{dict.subtotalLabel}</span>
            <span className="font-medium text-wa-text-primary">
              {formatPriceYuan(order.subtotalYuan, locale)}
            </span>
          </div>
          <div className="flex justify-between text-wa-text-secondary">
            <span>{dict.shippingFeeLabel}</span>
            <span className="font-medium text-wa-text-primary">
              {formatPriceYuan(order.shippingFeeYuan, locale)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between rounded-wa-bubble bg-wa-accent/12 px-3 py-1.5 text-wa-msg font-semibold text-wa-dark-green dark:text-wa-accent">
            <span>{dict.totalLabel}</span>
            <span className="text-wa-contact">
              {formatPriceYuan(order.totalYuan, locale)}
            </span>
          </div>
        </div>

        {/* Adresse de livraison en Chine */}
        <div className="mt-2.5 rounded-wa-bubble bg-wa-composer p-2.5 text-wa-meta">
          <p className="flex items-center gap-1.5 font-semibold text-wa-dark-green dark:text-wa-accent">
            <span aria-hidden="true">📍</span>
            <span>{dict.shippingAddressTitle}</span>
          </p>
          <p className="mt-0.5 text-wa-preview text-wa-text-primary">
            {order.shippingAddress.province} {order.shippingAddress.city}{' '}
            {order.shippingAddress.district}{' '}
            {order.shippingAddress.streetAddress}
          </p>
          <p className="mt-0.5 text-wa-text-secondary">
            {order.shippingAddress.recipientName} ·{' '}
            {order.shippingAddress.phone}
          </p>
        </div>

        {/* Bouton Confirmer la commande (Jaune doré #F2B705) ou Simuler l'étape suivante */}
        <div className="mt-3 space-y-2">
          {order.status === 'pending' ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onConfirmOrder(order.id)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-wa-bubble bg-wa-commerce px-4 py-2 text-wa-preview font-semibold text-wa-commerce-text shadow-wa-bubble transition-colors duration-fast hover:bg-wa-commerce-hover disabled:opacity-60"
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
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-wa-bubble bg-wa-accent px-3 py-2 text-wa-preview font-semibold text-white transition-colors duration-fast hover:opacity-95 disabled:opacity-60"
                >
                  <span aria-hidden="true">🚚</span>
                  <span>{dict.advanceStepButton}</span>
                </button>
              )}
              <Link
                href={`/${locale}/orders`}
                className="flex min-h-[44px] items-center justify-center rounded-wa-bubble border border-wa-border bg-wa-composer px-3 py-2 text-wa-preview font-medium text-wa-text-primary hover:bg-wa-border/60"
              >
                {dict.viewOrdersLink} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Carte 2 : Frise de suivi des 7 étapes dans le chat */}
      <div className="overflow-hidden rounded-wa-bubble border border-wa-border bg-wa-bubble-in p-3.5 text-wa-text-primary shadow-wa-bubble">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wa-border pb-2">
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true">🚚</span>
            <h4 className="text-wa-preview font-semibold text-wa-text-primary">
              {dict.trackingTitle}
            </h4>
          </div>
          <span className="text-wa-meta text-wa-text-secondary">
            {dict.orderNumberLabel}: {order.orderNumber}
          </span>
        </div>

        <ol className="mt-2.5 space-y-2">
          {order.timeline.map((event, idx) => {
            const isStepCompleted = idx < currentStepIdx || isDelivered;
            const isStepCurrent = idx === currentStepIdx && !isDelivered;

            return (
              <li
                key={event.id}
                className={`flex items-start justify-between gap-2 rounded-wa-bubble px-2 py-1 text-wa-meta ${
                  isStepCurrent ? 'bg-wa-system-bg text-wa-system-text' : ''
                }`}
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-wa-meta font-semibold ${
                      isStepCompleted
                        ? 'bg-wa-accent text-white'
                        : isStepCurrent
                        ? 'bg-wa-header text-white'
                        : 'bg-wa-composer text-wa-text-secondary'
                    }`}
                  >
                    {isStepCompleted ? '✓' : idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-wa-preview ${
                        isStepCurrent
                          ? 'font-semibold text-wa-text-primary'
                          : isStepCompleted
                          ? 'font-medium text-wa-text-primary'
                          : 'text-wa-text-secondary'
                      }`}
                    >
                      {idx + 1}. {statusDict[event.status]}
                    </p>
                    <p className="truncate text-wa-meta text-wa-text-secondary">
                      {formatDateTime(event.timestamp, locale)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-wa-meta font-medium ${
                    isStepCompleted
                      ? 'text-wa-accent'
                      : isStepCurrent
                      ? 'font-semibold text-wa-dark-green dark:text-wa-accent'
                      : 'text-wa-text-secondary'
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
      </div>
    </div>
  );
}
