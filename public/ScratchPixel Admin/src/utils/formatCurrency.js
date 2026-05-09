export function toSafeNumber(value = 0, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function formatCurrency(value = 0, options = {}) {
  const amount = toSafeNumber(value, 0);

  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(amount);
}

export function formatCoins(value = 0) {
  const coins = toSafeNumber(value, 0);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(coins);
}

export function coinsToRupees(coins = 0, coinValue = 100) {
  const safeCoins = toSafeNumber(coins, 0);
  const safeCoinValue = toSafeNumber(coinValue, 100);

  if (safeCoinValue <= 0) return 0;

  return safeCoins / safeCoinValue;
}

export function formatCoinsToRupees(coins = 0, coinValue = 100) {
  return formatCurrency(coinsToRupees(coins, coinValue), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export function rupeesToCoins(amount = 0, coinValue = 100) {
  const safeAmount = toSafeNumber(amount, 0);
  const safeCoinValue = toSafeNumber(coinValue, 100);

  if (safeCoinValue <= 0) return 0;

  return Math.ceil(safeAmount * safeCoinValue);
}