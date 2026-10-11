'use client';

import React, { useRef, useState } from 'react';
import type {
  ContactAttachment,
  DocumentAttachment,
  Locale,
  LocationAttachment,
} from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';

export interface AttachmentSheetProps {
  locale: Locale;
  dict: ChatDictionary['attachments'];
  onPickImages: (files: FileList) => void;
  onSendDemoMultiGrid: () => void;
  onSendDocument: (doc: DocumentAttachment) => void;
  onSendLocation: (loc: LocationAttachment) => void;
  onSendContact: (contact: ContactAttachment) => void;
  onSendQuickText: (text: string) => void;
  onOpenCatalogDrawer: () => void;
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
  locale,
  dict,
  onPickImages,
  onSendDemoMultiGrid,
  onSendDocument,
  onSendLocation,
  onSendContact,
  onSendQuickText,
  onOpenCatalogDrawer,
  onClose,
}: AttachmentSheetProps): React.JSX.Element {
  const [subView, setSubView] = useState<'main' | 'location' | 'contact'>(
    'main'
  );
  const [sizeError, setSizeError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const labels = {
    gallery:
      locale === 'zh' ? '相册' : locale === 'en' ? 'Gallery' : 'Galerie',
    camera: locale === 'zh' ? '相机' : locale === 'en' ? 'Camera' : 'Caméra',
    location:
      locale === 'zh' ? '位置' : locale === 'en' ? 'Location' : 'Localisation',
    contact:
      locale === 'zh' ? '名片' : locale === 'en' ? 'Contact' : 'Contact',
    document:
      locale === 'zh' ? '文件' : locale === 'en' ? 'Document' : 'Document',
    poll: locale === 'zh' ? '投票' : locale === 'en' ? 'Poll' : 'Sondage',
    event: locale === 'zh' ? '活动' : locale === 'en' ? 'Event' : 'Événement',
    aiImages:
      locale === 'zh'
        ? 'AI 图像'
        : locale === 'en'
        ? 'AI Images'
        : 'Images d’IA',
  };

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

  const handleSendPoll = (): void => {
    const pollMsg =
      locale === 'zh'
        ? '📊 [投票] 本周科特迪瓦木薯套餐偏好：\n1. 经典木薯 1kg + 烤金枪鱼 Garba\n2. 家庭装 5kg 冷链直发\n3. 辣椒酱 + 炸芭蕉 Alloco 组合'
        : locale === 'en'
        ? '📊 [Poll] Preferred Ivorian Attiéké pack this week:\n1. Classic Attiéké 1kg + Grilled Tuna Garba\n2. Family Pack 5kg Cold Chain\n3. Chili + Alloco Plantain Combo'
        : '📊 [Sondage] Quel pack Attiéké préférez-vous cette semaine ?\n1. Attiéké Classique 1kg + Thon Garba\n2. Pack Familial 5kg SF Cold Chain\n3. Duo Piment Frais + Alloco';
    onSendQuickText(pollMsg);
    onClose();
  };

  const handleSendEvent = (): void => {
    const eventMsg =
      locale === 'zh'
        ? '📅 [活动预约] 顺丰冷链同城配送时间确认：本周六 14:00 - 16:00（北京朝阳区建国路88号）'
        : locale === 'en'
        ? '📅 [Event] SF Express Cold Chain Delivery Slot: Saturday 14:00 - 16:00 (Beijing Chaoyang)'
        : '📅 [Événement] Créneau de réception SF Express Cold Chain : Samedi 14h00 - 16h00 (Pékin Chaoyang)';
    onSendQuickText(eventMsg);
    onClose();
  };

  return (
    <div className=" rounded-t-3xl border-t border-wa-border bg-wa-panel px-4 pb-6 pt-3 shadow-wa-panel">
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

      {/* Petite barre poignée grise centrée en haut (exactement comme sur image-1.png) */}
      <div className="mb-5 flex justify-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="h-1.5 w-11 rounded-full bg-wa-text-secondary/50"
        />
      </div>

      {sizeError && (
        <div
          role="alert"
          className="mb-3 rounded-wa-bubble border border-red-300 bg-red-50 px-3 py-2 text-wa-meta font-semibold text-red-700"
        >
          {sizeError}
        </div>
      )}

      {subView === 'main' && (
        <div className="mx-auto grid max-w-md grid-cols-4 gap-x-3 gap-y-5">
          {/* 1. Galerie (Bleu) */}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#1D9BF0]"
                aria-hidden="true"
              >
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 14H6l3.5-4.5 2.5 3 3.5-4.5 2.5 6z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.gallery}
            </span>
          </button>

          {/* 2. Caméra (Rose/Rouge) */}
          <button
            type="button"
            onClick={() => {
              onSendDemoMultiGrid();
              onClose();
            }}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#FF2E74]"
                aria-hidden="true"
              >
                <path d="M9 3 7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.camera}
            </span>
          </button>

          {/* 3. Localisation (Vert) */}
          <button
            type="button"
            onClick={() => setSubView('location')}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#00A884]"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.location}
            </span>
          </button>

          {/* 4. Contact (Bleu ciel) */}
          <button
            type="button"
            onClick={() => setSubView('contact')}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#00B2FF]"
                aria-hidden="true"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.contact}
            </span>
          </button>

          {/* 5. Document (Violet) */}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#7F66FF]"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 4h8v2H8v-2zm0 4h5v2H8v-2z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.document}
            </span>
          </button>

          {/* 6. Sondage (Jaune/Ambre) */}
          <button
            type="button"
            onClick={handleSendPoll}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#FFB300]"
                aria-hidden="true"
              >
                <rect x="4" y="5" width="10" height="3" rx="1.5" />
                <rect x="4" y="10.5" width="16" height="3" rx="1.5" />
                <rect x="4" y="16" width="7" height="3" rx="1.5" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.poll}
            </span>
          </button>

          {/* 7. Événement (Rose/Corail) */}
          <button
            type="button"
            onClick={handleSendEvent}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#FF4081]"
                aria-hidden="true"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm-7-7h5v5h-5v-5z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.event}
            </span>
          </button>

          {/* 8. Images d'IA / Catalogue Produits (Bleu étoilé) */}
          <button
            type="button"
            onClick={() => {
              onOpenCatalogDrawer();
              onClose();
            }}
            className="group flex flex-col items-center gap-2 focus:outline-none"
          >
            <span className="flex h-14 w-20 items-center justify-center rounded-full border border-wa-border bg-wa-composer transition-transform duration-fast group-active:scale-95">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-[#2196F3]"
                aria-hidden="true"
              >
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-2 6-1.25-2.75L13 5l2.75-1.25L17 1l1.25 2.75L21 5l-2.75 1.25L17 9zM6 17l3-4 2.25 3 3-4L18 17H6z" />
              </svg>
            </span>
            <span className="text-wa-preview text-wa-text-secondary">
              {labels.aiImages}
            </span>
          </button>
        </div>
      )}

      {subView === 'location' && (
        <div className="mx-auto max-w-md space-y-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-wa-preview font-semibold text-wa-text-primary">
              📍 {dict.locationModalTitle}
            </span>
            <button
              type="button"
              onClick={() => setSubView('main')}
              className="text-wa-meta font-semibold text-wa-accent"
            >
              ← Retour
            </button>
          </div>
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
              className="flex w-full items-center justify-between rounded-wa-bubble border border-wa-border bg-wa-composer px-4 py-2.5 text-left text-wa-preview font-medium text-wa-text-primary hover:border-wa-accent"
            >
              <span>{entry.label}</span>
              <span className="text-wa-accent">➤</span>
            </button>
          ))}
        </div>
      )}

      {subView === 'contact' && (
        <div className="mx-auto max-w-md space-y-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-wa-preview font-semibold text-wa-text-primary">
              👤 {dict.contactModalTitle}
            </span>
            <button
              type="button"
              onClick={() => setSubView('main')}
              className="text-wa-meta font-semibold text-wa-accent"
            >
              ← Retour
            </button>
          </div>
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
              className="flex w-full items-center justify-between rounded-wa-bubble border border-wa-border bg-wa-composer px-4 py-2.5 text-left text-wa-preview font-medium text-wa-text-primary hover:border-wa-accent"
            >
              <span>{entry.label}</span>
              <span className="text-wa-accent">➤</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
