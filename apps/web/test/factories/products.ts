import { type Product } from '@checkout/contracts';

export const demoProducts: Product[] = [
  {
    id: 'lamp-orbit',
    sku: 'DEMO-001',
    title: 'Настольная лампа «Орбита»',
    description: 'Компактная лампа с тёплым светом для рабочего стола.',
    price: 249000,
    currency: 'RUB',
    stock: 10,
  },
  {
    id: 'mug-line',
    sku: 'DEMO-002',
    title: 'Кружка «Линия»',
    description: 'Керамическая кружка, 350 мл.',
    price: 89000,
    currency: 'RUB',
    stock: 20,
  },
  {
    id: 'clock-dot',
    sku: 'DEMO-004',
    title: 'Часы «Точка»',
    description: 'Учебный пример товара, которого нет в наличии.',
    price: 329000,
    currency: 'RUB',
    stock: 0,
  },
];
