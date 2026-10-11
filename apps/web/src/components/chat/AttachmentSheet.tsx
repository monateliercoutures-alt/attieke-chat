'use client';

import React, { useRef, useState } from 'react';
import type {
  ContactAttachment,
  DocumentAttachment,
  LocationAttachment,
} from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';

export interface AttachmentSheetProps {
  dict: ChatDictionary['attachments'];
  onPickImages: (files: FileList) => void;
  onSendDemoMultiGrid: () => void;
  onSendDocument: (doc: DocumentAttachment) => void;
  onSendLocation: (loc: LocationAttachment) => void;
  onSendContact: (contact: ContactAttachment) => void;
  onClose: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

const PRESET_LOCATIONS: readonly LocationAttachment[] = [
  {
    id: 'loc-preset-bj',
    latitude: 39.9087,
    longitude: 116.4675,
    title: {
      zh: '北京朝阳区建国路88号 金茂大厦3栋',
      fr: 'Domicile Pékin Chaoyang — 88 Jianguo Rd, Bldg 3',
      en: 'Beijing Chaoyang Home — 88 Jianguo Rd, Bldg 3',
    },
    address: {
      zh: '北京市朝阳区建国路88号 1203室 (邮编 100022)',
      fr: '88 Jianguo Rd, Apt 1203, Chaoyang District, Pékin (100022)',
      en: '88 Jianguo Rd, Apt 1203, Chaoyang District, Beijing (100022)',
    },
  },
  {
    id: 'loc-preset-can',
    latitude: 23.3924,
    longitude: 113.2988,
    title: {
      zh: '广州白云国际机场顺丰冷链转运中心 (CAN)',
      fr: 'Hub Frigorifique SF Express — Aéroport Guangzhou Baiyun (CAN)',
      en: 'SF Express Cold Chain Hub — Guangzhou Baiyun Airport (CAN)',
    },
    address: {
      zh: '广东省广州市花都区白云国际机场综合保税区冷链园 B12',
      fr: 'Zone Franche Aéroport Baiyun, Bâtiment B12, Canton, Chine',
      en: 'Baiyun Airport Free Trade Zone, Bldg B12, Guangzhou, China',
    },
  },
  {
    id: 'loc-preset-abj',
    latitude: 5.3599,
    longitude: -3.9812,
    title: {
      zh: '阿比让科科迪木薯合作社工坊 (Cocody Riviera 2)',
      fr: 'Coopérative Attiéké Abidjan — Cocody Riviera 2',
      en: 'Attiéké Abidjan Cooperative — Cocody Riviera 2',
    },
    address: {
      zh: '科特迪瓦阿比让 Cocody Riviera 2, Bd François Mitterrand',
      fr: 'Bd François Mitterrand, Cocody Riviera 2, Abidjan, Côte d’Ivoire',
      en: 'Bd François Mitterrand, Cocody Riviera 2, Abidjan, Ivory Coast',
    },
  },
] as const;

const PRESET_CONTACTS: readonly ContactAttachment[] = [
  {
    id: 'contact-preset-sf',
    name: 'Chen Wei (陈伟 — SF Express Cold Chain)',
    phone: '+86 139 2880 9912',
    wechatId: 'SF_ColdChain_CAN',
    role: {
      zh: '广州白云机场顺丰冷链调度专员',
      fr: 'Coordinateur SF Express Cold Chain — Canton Baiyun',
      en: 'SF Express Cold Chain Coordinator — Guangzhou Baiyun',
    },
    avatarUrl: '/images/products/attieke-pack-1.jpg',
  },
  {
    id: 'contact-preset-chef',
    name: 'Chef Kouadio (科特迪瓦驻华主厨)',
    phone: '+86 136 1102 4480',
    wechatId: 'ChefKouadio_CI',
    role: {
      zh: '科特迪瓦阿比让传统美食与 Garba 顾问',
      fr: 'Chef Cuisinier Ivoirien — Conseils Vapeur & Garba',
      en: 'Ivorian Culinary Chef — Steaming & Garba Advisor',
    },
    avatarUrl: '/images/products/attieke-fish.jpg',
  },
  {
    id: 'contact-preset-client',
    name: 'Li Mei / Awa Koné (Client Pékin)',
    phone: '+86 138 0013 8000',
    wechatId: 'AwaKone_BJ88',
    role: {
      zh: '北京朝阳区收件人名片',
      fr: 'Coordonnées Destinataire Pékin Chaoyang',
      en: 'Beijing Chaoyang Recipient Contact Card',
    },
    avatarUrl: '/images/avatars/vendor.jpg',
  },
] as const;

export function AttachmentSheet({
  dict,
  onPickImages,
  onSendDemoMultiGrid,
  onSendDocument,
  onSendLocation,
  onSendContact,
  onClose,
}: AttachmentSheetProps): React.JSX.Element {
  const [subView, setSubView] = useState<'main' | 'location' | 'contact'>(
    'main'
  );
  const [sizeError, setSizeError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    for (let i = 0; i < files.length; i += 1) {
      if (files[i].size > MAX_FILE_SIZE_BYTES) {
        setSizeError(dict.fileSizeError);
        return;
      }
    }
    onPickImages(files);
    e.target.value = '';
    onClose();
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSizeError(dict.fileSizeError);
      return;
    }
    const doc: DocumentAttachment = {
      id: `doc-${Date.now()}`,
      url: '/images/products/attieke-classic.jpg',
      fileName: file.name,
      fileSizeBytes: Math.max(1024, file.size),
      mimeType: file.type || 'application/pdf',
      pageCount: 1,
    };
    onSendDocument(doc);
    e.target.value = '';
    onClose();
  };

  const handleSendDemoPdf = (): void => {
    const doc: DocumentAttachment = {
      id: `doc-demo-${Date.now()}`,
      url: '/images/products/attieke-classic.jpg',
      fileName: 'Facture-Douane-SF-Express-Abidjan-2026.pdf',
      fileSizeBytes: 356400,
      mimeType: 'application/pdf',
      pageCount: 2,
    };
    onSendDocument(doc);
    onClose();
  };

  return (
    <div className="border-t border-brand-ink/10 bg-white p-4 shadow-lg">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoSelect}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={handleDocSelect}
        className="hidden"
      />

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
          {subView === 'location'
            ? dict.locationModalTitle
            : subView === 'contact'
            ? dict.contactModalTitle
            : dict.sheetTitle}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-brand-cream px-2.5 py-1 text-xs font-bold text-brand-ink"
        >
          ✕
        </button>
      </div>

      {sizeError && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
        >
          {sizeError}
        </div>
      )}

      {subView === 'main' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3 text-center transition-colors hover:bg-brand-green-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-lg text-white">
                🖼️
              </span>
              <span className="text-[11px] font-extrabold text-brand-ink">
                {dict.photoGallery}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSendDemoMultiGrid();
                onClose();
              }}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3 text-center transition-colors hover:bg-brand-green-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-lg text-white">
                📷
              </span>
              <span className="text-[11px] font-extrabold text-brand-ink">
                {dict.cameraPhoto}
              </span>
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3 text-center transition-colors hover:bg-brand-green-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg text-white">
                📄
              </span>
              <span className="text-[11px] font-extrabold text-brand-ink">
                {dict.documentPdf}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubView('location')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3 text-center transition-colors hover:bg-brand-green-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-lg text-white">
                📍
              </span>
              <span className="text-[11px] font-extrabold text-brand-ink">
                {dict.locationPin}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubView('contact')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-brand-ink/10 bg-brand-cream p-3 text-center transition-colors hover:bg-brand-green-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-lg text-white">
                👤
              </span>
              <span className="text-[11px] font-extrabold text-brand-ink">
                {dict.contactCard}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendDemoPdf}
            className="w-full rounded-xl border border-brand-green/25 bg-brand-green-soft/60 py-2 text-xs font-extrabold text-brand-green hover:bg-brand-green hover:text-white"
          >
            {dict.demoPdfButton}
          </button>
        </div>
      )}

      {subView === 'location' && (
        <div className="space-y-2">
          {[
            { label: dict.locBeijing, item: PRESET_LOCATIONS[0] },
            { label: dict.locGuangzhou, item: PRESET_LOCATIONS[1] },
            { label: dict.locAbidjan, item: PRESET_LOCATIONS[2] },
          ].map((entry) => (
            <button
              key={entry.item.id}
              type="button"
              onClick={() => {
                onSendLocation(entry.item);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-brand-ink/10 bg-brand-cream px-4 py-2.5 text-left text-xs font-extrabold text-brand-ink hover:bg-brand-green-soft"
            >
              <span>{entry.label}</span>
              <span className="text-brand-green">➤</span>
            </button>
          ))}
        </div>
      )}

      {subView === 'contact' && (
        <div className="space-y-2">
          {[
            { label: dict.contactSfAgent, item: PRESET_CONTACTS[0] },
            { label: dict.contactChef, item: PRESET_CONTACTS[1] },
            { label: dict.contactCustomer, item: PRESET_CONTACTS[2] },
          ].map((entry) => (
            <button
              key={entry.item.id}
              type="button"
              onClick={() => {
                onSendContact(entry.item);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-brand-ink/10 bg-brand-cream px-4 py-2.5 text-left text-xs font-extrabold text-brand-ink hover:bg-brand-green-soft"
            >
              <span>{entry.label}</span>
              <span className="text-brand-green">➤</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
