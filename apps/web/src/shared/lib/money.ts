const rubles = (fractionDigits: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

const wholeRubles = rubles(0);
const preciseRubles = rubles(2);

export const formatMoney = (kopecks: number) =>
  (kopecks % 100 === 0 ? wholeRubles : preciseRubles).format(kopecks / 100);
