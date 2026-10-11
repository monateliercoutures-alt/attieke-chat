import type {
  Address,
  Conversation,
  LocalizedText,
  Message,
  Order,
  OrderStatus,
  OrderStatusEvent,
  Product,
  User,
} from '@attieke-chat/shared';
import { ORDER_STATUS_SEQUENCE } from '@attieke-chat/shared';

// ============================================================================
// 1. ADRESSES DE LIVRAISON EN CHINE (2 adresses réalistes)
// ============================================================================

export const INITIAL_ADDRESSES: readonly Address[] = [
  {
    id: 'addr-beijing-01',
    label: '北京自宅 / Domicile Pékin',
    recipientName: 'Li Mei (Awa Koné)',
    phone: '+86 138 0013 8000',
    province: '北京市 (Beijing)',
    city: '北京市 (Beijing)',
    district: '朝阳区 (Chaoyang)',
    streetAddress: '建国路88号 金茂大厦 3栋 1203室 (88 Jianguo Rd, Bldg 3, Apt 1203)',
    postalCode: '100022',
    isDefault: true,
  },
  {
    id: 'addr-guangzhou-02',
    label: '广州工作室 / Bureau Canton',
    recipientName: 'Li Mei (Awa Koné)',
    phone: '+86 139 2210 5678',
    province: '广东省 (Guangdong)',
    city: '广州市 (Guangzhou)',
    district: '越秀区 (Yuexiu)',
    streetAddress: '环市东路362号 好世界广场 1806室 (362 Huanshi East Rd, Suite 1806)',
    postalCode: '510060',
    isDefault: false,
  },
] as const;

// ============================================================================
// 2. UTILISATEUR MOCKÉ PAR DÉFAUT
// ============================================================================

export const INITIAL_USER: User = {
  id: 'user-client-01',
  name: 'Li Mei (Awa Koné)',
  phone: '+86 138 0013 8000',
  email: 'awa.kone@attieke-client.cn',
  wechatId: 'AwaKone_BJ88',
  preferredLocale: 'zh',
  addresses: [...INITIAL_ADDRESSES],
  createdAt: '2026-09-15T10:00:00.000Z',
};

// ============================================================================
// 3. CATALOGUE DE 8 PRODUITS (formats et poids variés, prix en yuan ¥)
// ============================================================================

export const INITIAL_PRODUCTS: readonly Product[] = [
  {
    id: 'prod-01',
    slug: 'attieke-1kg',
    category: 'attieke',
    name: {
      zh: '经典原味阿蒂耶克 (Attiéké)',
      fr: 'Attiéké Nature Authentique',
      en: 'Classic Authentic Attiéké',
    },
    shortDescription: {
      zh: '100% 科特迪瓦木薯传统发酵蒸制，颗粒饱满松软，真空锁鲜袋装。',
      fr: 'Semoule de manioc ivoirienne fermentée et cuite à la vapeur, grains souples en sachet sous vide.',
      en: '100% traditional fermented & steamed Ivorian cassava couscous in a vacuum-sealed pack.',
    },
    fullDescription: {
      zh: '甄选科特迪瓦阿比让优质木薯，由当地经验丰富的妈妈们手工发酵、筛粒、蒸制后立即真空封存。无防腐剂，微酸清香，松软弹牙。',
      fr: 'Préparé artisanalement à Abidjan par nos productrices partenaires puis mis sous vide immédiatement après cuisson vapeur pour préserver son arôme authentique.',
      en: 'Handcrafted in Abidjan by local women artisans and vacuum-sealed right after steaming to lock in its signature tangy aroma and fluffy grain.',
    },
    weightKg: 1,
    formatLabel: {
      zh: '1 kg 标准真空袋',
      fr: 'Sachet sous vide 1 kg',
      en: '1 kg Vacuum Pouch',
    },
    priceYuan: 28,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-solo.jpg',
    inStock: true,
    featured: true,
    preparationTips: {
      zh: '洒少许饮用水，蒸锅蒸 5 分钟或微波炉高火 2 分钟即可。',
      fr: 'Ajoutez quelques gouttes d’eau, réchauffez 5 min à la vapeur ou 2 min au micro-ondes.',
      en: 'Sprinkle a little water, steam for 5 minutes or microwave on high for 2 minutes.',
    },
  },
  {
    id: 'prod-02',
    slug: 'tilapia-attieke-1kg',
    category: 'combo_fish',
    name: {
      zh: '炭烤罗非鱼 (Tilapia) + 阿蒂耶克',
      fr: 'Tilapia Braisé + Attiéké',
      en: 'Grilled Tilapia + Attiéké Combo',
    },
    shortDescription: {
      zh: '外焦里嫩的科特迪瓦风味烤鱼，搭配 1 kg 新鲜阿蒂耶克、特调辣椒酱与洋葱番茄。',
      fr: 'Poisson tilapia mariné aux épices du pays et braisé, servi avec 1 kg d’attiéké, piment et moyo.',
      en: 'Charcoal-style spiced tilapia served with 1 kg of fresh attiéké, house pepper sauce, and moyo.',
    },
    fullDescription: {
      zh: '科特迪瓦街头最受欢迎的国菜组合！整条罗非鱼用天然香料腌制炭烤后急速锁鲜，附带 1 公斤阿蒂耶克与正宗 Moyo 番茄洋葱调料包。',
      fr: 'Le grand classique des maquis d’Abidjan ! Un tilapia entier mariné et braisé, livré avec 1 kg d’attiéké frais et sa garniture moyo-piment.',
      en: 'Abidjan’s most iconic dish! A whole spiced & grilled tilapia paired with 1 kg of fresh attiéké and authentic tomato-onion moyo relish.',
    },
    weightKg: 1,
    formatLabel: {
      zh: '1 kg 套餐（含整鱼 + 阿蒂耶克）',
      fr: 'Formule 1 kg (Poisson entier + Attiéké)',
      en: '1 kg Combo (Whole Fish + Attiéké)',
    },
    priceYuan: 42,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-tilapia.jpg',
    inStock: true,
    featured: true,
    preparationTips: {
      zh: '烤鱼用空气炸锅或烤箱 180°C 加热 8 分钟，阿蒂耶克蒸热同食。',
      fr: 'Réchauffez le poisson 8 min au four/air-fryer à 180 °C et l’attiéké 2 min au micro-ondes.',
      en: 'Reheat the fish for 8 mins at 180°C in an oven/air-fryer and steam the attiéké for 2 mins.',
    },
  },
  {
    id: 'prod-03',
    slug: 'kedjenou-attieke-1kg',
    category: 'combo_meat',
    name: {
      zh: '科特迪瓦炖鸡 (Kedjenou) + 阿蒂耶克',
      fr: 'Kedjenou de Poulet + Attiéké',
      en: 'Chicken Kedjenou + Attiéké Combo',
    },
    shortDescription: {
      zh: '传统慢火陶罐香料炖鸡，肉质软烂入味，浓郁汤汁拌阿蒂耶克绝佳。',
      fr: 'Poulet mijoté à l’étouffée aux aromates ivoiriens avec sauce onctueuse et 1 kg d’attiéké.',
      en: 'Slow-simmered Ivorian spiced chicken stew with rich gravy and 1 kg of fluffy attiéké.',
    },
    fullDescription: {
      zh: '采用科特迪瓦传统 Kedjenou 焖炖工艺，鸡肉与番茄、洋葱、生姜及非洲香草慢炖数小时，浓汁裹满每一粒阿蒂耶克。',
      fr: 'Cuisiné selon la recette traditionnelle du Kedjenou ivoirien : poulet fermier mijoté longuement avec tomates, oignons, gingembre et piment doux.',
      en: 'Cooked in the traditional Ivorian Kedjenou style: tender chicken simmered with tomatoes, onions, ginger, and aromatic herbs.',
    },
    weightKg: 1,
    formatLabel: {
      zh: '1 kg 套餐（炖鸡 + 阿蒂耶克）',
      fr: 'Formule 1 kg (Kedjenou + Attiéké)',
      en: '1 kg Combo (Kedjenou + Attiéké)',
    },
    priceYuan: 36,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-kedjenou.jpg',
    inStock: true,
    featured: true,
    preparationTips: {
      zh: '炖鸡连袋隔水加热 6 分钟或倒入碗中微波加热 3 分钟，淋在阿蒂耶克上享用。',
      fr: 'Réchauffez la sauce kedjenou 3 min à la casserole ou au micro-ondes et nappez votre attiéké.',
      en: 'Warm the kedjenou stew for 3 mins in a pan or microwave and pour over the warm attiéké.',
    },
  },
  {
    id: 'prod-04',
    slug: 'attieke-familial-2-5kg',
    category: 'attieke',
    name: {
      zh: '家庭实惠装阿蒂耶克 (2.5 kg)',
      fr: 'Pack Familial Attiéké (2,5 kg)',
      en: 'Family Pack Attiéké (2.5 kg)',
    },
    shortDescription: {
      zh: '适合朋友聚会或宿舍分享的大容量真空装，内含 5 袋 500g 独立小包装。',
      fr: 'Idéal pour les repas entre amis ou étudiants : lot économique de 5 sachets sous vide de 500 g.',
      en: 'Perfect for gatherings or students: value pack of 5 individual 500g vacuum-sealed pouches.',
    },
    fullDescription: {
      zh: '内含 5 袋 500 克独立真空包装，随吃随拆，不浪费，冷冻保存长达 3 个月，性价比最高。',
      fr: 'Conditionné en 5 portions individuelles de 500 g sous vide pour ouvrir uniquement ce dont vous avez besoin tout en gardant le reste au frais.',
      en: 'Packaged in 5 individual 500g vacuum pouches so you can open one meal at a time and store the rest in the freezer.',
    },
    weightKg: 2.5,
    formatLabel: {
      zh: '2.5 kg 家庭装 (5 × 500g)',
      fr: 'Format Familial 2,5 kg (5 × 500 g)',
      en: '2.5 kg Family Pack (5 × 500g)',
    },
    priceYuan: 64,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-classic.jpg',
    inStock: true,
    featured: false,
    preparationTips: {
      zh: '每次取出一小袋加热，其余放冷冻室保存。',
      fr: 'Réchauffez un sachet de 500 g à la fois, conservez les autres au congélateur.',
      en: 'Heat one 500g pouch at a time and keep the remaining pouches frozen.',
    },
  },
  {
    id: 'prod-05',
    slug: 'attieke-agbodjama-1kg',
    category: 'attieke',
    name: {
      zh: '特级大颗粒阿蒂耶克 (Agbodjama)',
      fr: 'Attiéké Agbodjama Grand Grain',
      en: 'Premium Agbodjama Large-Grain Attiéké',
    },
    shortDescription: {
      zh: '科特迪瓦埃布里耶族传统大颗粒工艺，口感更有嚼劲，行家首选。',
      fr: 'La variété noble d’attiéké aux gros grains roulés à la main selon le savoir-faire Ébrié.',
      en: 'The prized large-grain Ivorian attiéké hand-rolled following traditional Ébrié craftsmanship.',
    },
    fullDescription: {
      zh: 'Agbodjama 是科特迪瓦最受推崇的高端阿蒂耶克品种，颗粒圆润分明，木薯香气极其浓郁，单吃或配烤鱼皆是一流。',
      fr: 'L’Agbodjama est la variété la plus recherchée en Côte d’Ivoire : ses gros grains réguliers ne collent jamais et offrent une mâche incomparable.',
      en: 'Agbodjama is Ivory Coast’s finest attiéké variety, prized for its distinct, non-sticky large grains and rich aroma.',
    },
    weightKg: 1,
    formatLabel: {
      zh: '1 kg 臻选大颗粒装',
      fr: 'Sachet Premium 1 kg',
      en: '1 kg Premium Pouch',
    },
    priceYuan: 34,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-solo.jpg',
    inStock: true,
    featured: false,
    preparationTips: {
      zh: '淋几滴花生油与少许水蒸 4 分钟，颗粒更加晶莹饱满。',
      fr: 'Ajoutez un filet d’huile et quelques gouttes d’eau avant de réchauffer 4 min à la vapeur.',
      en: 'Add a drop of oil and water before steaming for 4 minutes for glossy, separated grains.',
    },
  },
  {
    id: 'prod-06',
    slug: 'alloco-poisson-attieke-1-2kg',
    category: 'combo_fish',
    name: {
      zh: '黄金炸芭蕉 (Alloco) + 烤鱼 + 阿蒂耶克',
      fr: 'Menu Alloco + Tilapia Braisé + Attiéké',
      en: 'Alloco Plantain + Grilled Fish + Attiéké',
    },
    shortDescription: {
      zh: '香甜软糯的炸大蕉 (Alloco) 加上炭烤罗非鱼与阿蒂耶克，一次尝遍阿比让三宝。',
      fr: 'Le trio roi d’Abidjan : bananes plantains mûres frites (Alloco), tilapia braisé et attiéké frais.',
      en: 'Abidjan’s royal trio: sweet fried ripe plantains (Alloco), grilled tilapia, and fresh attiéké.',
    },
    fullDescription: {
      zh: '专为想念科特迪瓦夜市美食的朋友打造！包含成熟大蕉炸制的黄金 Alloco、炭烤整条罗非鱼及阿蒂耶克。',
      fr: 'Retrouvez toute l’ambiance d’Abidjan dans une seule commande : alloco doré et fondant, poisson braisé épicé et semoule d’attiéké.',
      en: 'Experience the full Abidjan street-food feast in one box: golden sweet alloco plantains, spiced grilled tilapia, and attiéké.',
    },
    weightKg: 1.2,
    formatLabel: {
      zh: '1.2 kg 豪华三合一套餐',
      fr: 'Menu Complet 1,2 kg',
      en: '1.2 kg Full Feast Combo',
    },
    priceYuan: 52,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-tilapia.jpg',
    inStock: true,
    featured: false,
    preparationTips: {
      zh: 'Alloco 与烤鱼放入烤箱/空气炸锅复烤 6 分钟更酥脆。',
      fr: 'Passez l’alloco et le poisson 6 min à l’air-fryer pour retrouver tout leur croustillant.',
      en: 'Crisp the alloco and fish in an air-fryer for 6 minutes before serving with warm attiéké.',
    },
  },
  {
    id: 'prod-07',
    slug: 'choukouya-boeuf-attieke-1kg',
    category: 'combo_meat',
    name: {
      zh: '科特迪瓦炭烤牛肉 (Choukouya) + 阿蒂耶克',
      fr: 'Choukouya de Bœuf Braisé + Attiéké',
      en: 'Ivorian Beef Choukouya + Attiéké',
    },
    shortDescription: {
      zh: '撒满传统 Kankankan 香料粉的炭烤牛肉块，焦香多汁，配 1 kg 阿蒂耶克。',
      fr: 'Morceaux de bœuf braisés aux épices kankankan et oignons croquants, servis avec 1 kg d’attiéké.',
      en: 'Flame-grilled beef cubes seasoned with kankankan spice blend, served with 1 kg of attiéké.',
    },
    fullDescription: {
      zh: 'Choukouya 是科特迪瓦炭火烤肉的代表作，精选牛肋条配秘制香料烤制，肉香四溢。',
      fr: 'Le vrai Choukouya ivoirien grillé à la flamme et relevé aux épices douces, accompagné d’attiéké souple et d’oignons émincés.',
      en: 'Authentic flame-seared Ivorian beef Choukouya seasoned with traditional spices and served with fluffy attiéké.',
    },
    weightKg: 1,
    formatLabel: {
      zh: '1 kg 烤牛肉套餐',
      fr: 'Formule Choukouya 1 kg',
      en: '1 kg Beef Choukouya Combo',
    },
    priceYuan: 46,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-kedjenou.jpg',
    inStock: true,
    featured: false,
    preparationTips: {
      zh: '牛肉平底锅干煎或烤箱加热 5 分钟即可恢复炭烤香气。',
      fr: 'Poêlez le choukouya 4 à 5 min à feu vif pour réveiller le goût braisé.',
      en: 'Sear the beef in a hot pan for 4–5 minutes to revive its smoky aroma.',
    },
  },
  {
    id: 'prod-08',
    slug: 'piment-moyo-maison-250g',
    category: 'condiment',
    name: {
      zh: '阿比让秘制鲜椒酱 & Moyo 调味包',
      fr: 'Sauce Piment & Moyo Ivoirien Maison',
      en: 'House Ivorian Pepper Sauce & Moyo Pack',
    },
    shortDescription: {
      zh: '科特迪瓦灯笼椒熬制的鲜辣红油酱，阿蒂耶克与烤鱼的灵魂伴侣。',
      fr: 'Purée de piment frais parfumé aux aromates du pays, indispensable pour accompagner votre attiéké.',
      en: 'Fragrant habanero pepper sauce simmered with Ivorian herbs—the ultimate attiéké companion.',
    },
    fullDescription: {
      zh: '采用科特迪瓦进口辣椒与新鲜大蒜、生姜慢火熬制，辣而不燥、果香浓郁，单瓶 250 克密封罐装。',
      fr: 'Préparé maison avec des piments frais, ail, gingembre et huile parfumée. Se conserve plusieurs semaines au frais.',
      en: 'Small-batch homemade pepper sauce crafted with fresh chilies, garlic, and ginger. Keeps for weeks refrigerated.',
    },
    weightKg: 0.25,
    formatLabel: {
      zh: '250g 密封罐装',
      fr: 'Pot hermétique 250 g',
      en: '250g Sealed Jar',
    },
    priceYuan: 15,
    currency: 'CNY',
    imageSrc: '/images/hero/hero-bowl.jpg',
    inStock: true,
    featured: false,
    preparationTips: {
      zh: '开盖即食，每次取半勺拌入阿蒂耶克即可。',
      fr: 'Prêt à déguster : ajoutez une demi-cuillère sur votre poisson ou votre attiéké.',
      en: 'Ready to eat: dab half a spoonful alongside your fish or attiéké.',
    },
  },
] as const;

// ============================================================================
// 4. GÉNÉRATEUR DES 7 ÉTAPES DE SUIVI DE COMMANDE
// ============================================================================

const STATUS_DESCRIPTIONS: Record<
  OrderStatus,
  { location: LocalizedText; note: LocalizedText }
> = {
  pending: {
    location: {
      zh: '线上聊天订单中心',
      fr: 'Centre de commande Chat',
      en: 'Chat Order Desk',
    },
    note: {
      zh: '订单已提交，等待卖家核对库存与运费',
      fr: 'Commande créée dans le chat, en attente de validation vendeur',
      en: 'Order created in chat, awaiting seller confirmation',
    },
  },
  confirmed: {
    location: {
      zh: '阿比让 / 中国客服中心',
      fr: 'Service Client Abidjan / Chine',
      en: 'Abidjan / China Customer Desk',
    },
    note: {
      zh: '卖家已确认商品明细与收货地址',
      fr: 'Détails des produits et adresse en Chine confirmés par le vendeur',
      en: 'Items and China delivery address confirmed by seller',
    },
  },
  paid: {
    location: {
      zh: '微信支付 / 支付宝安全结算',
      fr: 'Paiement sécurisé WeChat / Alipay',
      en: 'WeChat Pay / Alipay Settlement',
    },
    note: {
      zh: '付款成功，正在安排真空冷链打包',
      fr: 'Paiement reçu, préparation et mise sous vide en cours',
      en: 'Payment received, vacuum-packing in progress',
    },
  },
  shipped: {
    location: {
      zh: '科特迪瓦 · 阿比让博瓦尼国际机场',
      fr: 'Aéroport Félix-Houphouët-Boigny, Abidjan',
      en: 'Félix-Houphouët-Boigny Airport, Abidjan',
    },
    note: {
      zh: '包裹已由阿比让冷链发出，登上直飞中国货运航班',
      fr: 'Colis expédié depuis Abidjan par fret aérien à température contrôlée',
      en: 'Parcel dispatched from Abidjan via temperature-controlled air cargo',
    },
  },
  customs: {
    location: {
      zh: '中国 · 广州白云机场海关清关中心',
      fr: 'Douane Aéroport de Canton Baiyun, Chine',
      en: 'Guangzhou Baiyun Customs Hub, China',
    },
    note: {
      zh: '包裹正在中国海关进行检验检疫与清关放行',
      fr: 'Contrôle sanitaire et dédouanement express en cours en Chine',
      en: ' undergoing customs inspection and release in China',
    },
  },
  in_china_transit: {
    location: {
      zh: '中国境内 · 顺丰冷链转运中心',
      fr: 'Hub SF Express Chaîne du Froid, Chine',
      en: 'SF Express Cold-Chain Hub, China',
    },
    note: {
      zh: '清关完成，已交由顺丰速运冷链发往目的地城市',
      fr: 'Dédouané et pris en charge par SF Express vers votre ville',
      en: 'Cleared customs and handed over to SF Express for domestic delivery',
    },
  },
  delivered: {
    location: {
      zh: '客户收货地址（已签收）',
      fr: 'Adresse du client (Livré)',
      en: 'Customer Address (Delivered)',
    },
    note: {
      zh: '包裹已送达客户手中，祝您用餐愉快！',
      fr: 'Colis livré en main propre. Bon appétit !',
      en: 'Parcel delivered to customer. Enjoy your meal!',
    },
  },
};

export function buildOrderTimeline(
  orderId: string,
  currentStatus: OrderStatus,
  baseDateIso: string
): OrderStatusEvent[] {
  const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  const baseTime = new Date(baseDateIso).getTime();

  return ORDER_STATUS_SEQUENCE.map((status, index) => {
    const completed = index <= currentIdx;
    const stepTime = new Date(baseTime + index * 6 * 3600 * 1000).toISOString();
    const meta = STATUS_DESCRIPTIONS[status];

    return {
      id: `${orderId}-evt-${index + 1}`,
      status,
      timestamp: stepTime,
      location: meta.location,
      note: meta.note,
      completed,
    };
  });
}

// ============================================================================
// 5. 5 COMMANDES MOCKÉES À DES STATUTS DIFFÉRENTS
// ============================================================================

export const INITIAL_ORDERS: readonly Order[] = [
  {
    id: 'ord-01',
    orderNumber: 'OD20261010012345',
    userId: 'user-client-01',
    items: [
      {
        productId: 'prod-01',
        productSlug: 'attieke-1kg',
        productName: INITIAL_PRODUCTS[0].name,
        productImage: INITIAL_PRODUCTS[0].imageSrc,
        weightKg: 1,
        unitPriceYuan: 28,
        quantity: 1,
      },
      {
        productId: 'prod-02',
        productSlug: 'tilapia-attieke-1kg',
        productName: INITIAL_PRODUCTS[1].name,
        productImage: INITIAL_PRODUCTS[1].imageSrc,
        weightKg: 1,
        unitPriceYuan: 42,
        quantity: 1,
      },
    ],
    subtotalYuan: 70,
    shippingFeeYuan: 12,
    totalYuan: 82,
    currency: 'CNY',
    status: 'customs',
    trackingNumber: 'SF1428990234188',
    shippingAddress: INITIAL_ADDRESSES[0],
    timeline: buildOrderTimeline('ord-01', 'customs', '2026-10-09T06:30:00.000Z'),
    createdAt: '2026-10-09T06:30:00.000Z',
    updatedAt: '2026-10-10T16:20:00.000Z',
  },
  {
    id: 'ord-02',
    orderNumber: 'OD20261011054321',
    userId: 'user-client-01',
    items: [
      {
        productId: 'prod-03',
        productSlug: 'kedjenou-attieke-1kg',
        productName: INITIAL_PRODUCTS[2].name,
        productImage: INITIAL_PRODUCTS[2].imageSrc,
        weightKg: 1,
        unitPriceYuan: 36,
        quantity: 2,
      },
    ],
    subtotalYuan: 72,
    shippingFeeYuan: 12,
    totalYuan: 84,
    currency: 'CNY',
    status: 'pending',
    shippingAddress: INITIAL_ADDRESSES[0],
    timeline: buildOrderTimeline('ord-02', 'pending', '2026-10-11T08:15:00.000Z'),
    createdAt: '2026-10-11T08:15:00.000Z',
    updatedAt: '2026-10-11T08:15:00.000Z',
  },
  {
    id: 'ord-03',
    orderNumber: 'OD20261010098765',
    userId: 'user-client-01',
    items: [
      {
        productId: 'prod-04',
        productSlug: 'attieke-familial-2-5kg',
        productName: INITIAL_PRODUCTS[3].name,
        productImage: INITIAL_PRODUCTS[3].imageSrc,
        weightKg: 2.5,
        unitPriceYuan: 64,
        quantity: 1,
      },
      {
        productId: 'prod-08',
        productSlug: 'piment-moyo-maison-250g',
        productName: INITIAL_PRODUCTS[7].name,
        productImage: INITIAL_PRODUCTS[7].imageSrc,
        weightKg: 0.25,
        unitPriceYuan: 15,
        quantity: 1,
      },
    ],
    subtotalYuan: 79,
    shippingFeeYuan: 12,
    totalYuan: 91,
    currency: 'CNY',
    status: 'confirmed',
    shippingAddress: INITIAL_ADDRESSES[1],
    timeline: buildOrderTimeline('ord-03', 'confirmed', '2026-10-10T11:00:00.000Z'),
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-10T14:00:00.000Z',
  },
  {
    id: 'ord-04',
    orderNumber: 'OD20261008077889',
    userId: 'user-client-01',
    items: [
      {
        productId: 'prod-06',
        productSlug: 'alloco-poisson-attieke-1-2kg',
        productName: INITIAL_PRODUCTS[5].name,
        productImage: INITIAL_PRODUCTS[5].imageSrc,
        weightKg: 1.2,
        unitPriceYuan: 52,
        quantity: 1,
      },
    ],
    subtotalYuan: 52,
    shippingFeeYuan: 12,
    totalYuan: 64,
    currency: 'CNY',
    status: 'in_china_transit',
    trackingNumber: 'SF1428990119002',
    shippingAddress: INITIAL_ADDRESSES[0],
    timeline: buildOrderTimeline(
      'ord-04',
      'in_china_transit',
      '2026-10-08T09:00:00.000Z'
    ),
    createdAt: '2026-10-08T09:00:00.000Z',
    updatedAt: '2026-10-10T19:00:00.000Z',
  },
  {
    id: 'ord-05',
    orderNumber: 'OD20261001033445',
    userId: 'user-client-01',
    items: [
      {
        productId: 'prod-05',
        productSlug: 'attieke-agbodjama-1kg',
        productName: INITIAL_PRODUCTS[4].name,
        productImage: INITIAL_PRODUCTS[4].imageSrc,
        weightKg: 1,
        unitPriceYuan: 34,
        quantity: 2,
      },
    ],
    subtotalYuan: 68,
    shippingFeeYuan: 12,
    totalYuan: 80,
    currency: 'CNY',
    status: 'delivered',
    trackingNumber: 'SF1428990001823',
    shippingAddress: INITIAL_ADDRESSES[0],
    timeline: buildOrderTimeline('ord-05', 'delivered', '2026-10-01T08:00:00.000Z'),
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-04T15:00:00.000Z',
  },
] as const;

// ============================================================================
// 6. 3 CONVERSATIONS & 60 MESSAGES VARIÉS SUR PLUSIEURS JOURS
// ============================================================================

import {
  buildInitialMessages,
  INITIAL_CHAT_PREFERENCES,
  INITIAL_CONVERSATIONS,
  INITIAL_PRESENCE_MAP,
} from './chatSeed';

export {
  INITIAL_CHAT_PREFERENCES,
  INITIAL_CONVERSATIONS,
  INITIAL_PRESENCE_MAP,
};

export const INITIAL_CONVERSATION: Conversation = INITIAL_CONVERSATIONS[0];

export const INITIAL_MESSAGES: readonly Message[] = buildInitialMessages(
  INITIAL_ORDERS[0].timeline[4],
  INITIAL_ORDERS[3].timeline[5]
);

