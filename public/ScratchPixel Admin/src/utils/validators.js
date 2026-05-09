export function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isValidPhone(phone = "") {
  return /^[6-9]\d{9}$/.test(String(phone || "").trim());
}

export function isValidUpiId(upi = "") {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(
    String(upi || "").trim()
  );
}

export function isValidPan(pan = "") {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
    String(pan || "").trim().toUpperCase()
  );
}

export function isValidAmount(amount, min = 1) {
  const number = Number(amount);
  return Number.isFinite(number) && number >= Number(min || 1);
}

export function isPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

export function isNonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
}

export function validateWithdrawal({ amount, upiId, minWithdrawal = 50 }) {
  const errors = {};

  if (!isValidAmount(amount, minWithdrawal)) {
    errors.amount = `Minimum withdrawal amount is ₹${minWithdrawal}.`;
  }

  if (!isValidUpiId(upiId)) {
    errors.upiId = "Please enter a valid UPI ID.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateScratchRules(rules = {}) {
  const errors = {};

  const freeScratchPerDay = Number(rules.freeScratchPerDay || 1);
  const minCoins = Number(rules.scratchMinCoins ?? rules.minCoins ?? 0);
  const maxCoins = Number(rules.scratchMaxCoins ?? rules.maxCoins ?? 0);

  if (!Number.isFinite(freeScratchPerDay) || freeScratchPerDay <= 0) {
    errors.freeScratchPerDay = "Free scratch per day must be at least 1.";
  }

  if (!Number.isFinite(minCoins) || minCoins < 0) {
    errors.scratchMinCoins = "Minimum coins cannot be negative.";
  }

  if (!Number.isFinite(maxCoins) || maxCoins < 0) {
    errors.scratchMaxCoins = "Maximum coins cannot be negative.";
  }

  if (maxCoins < minCoins) {
    errors.scratchMaxCoins =
      "Maximum coins must be greater than or equal to minimum coins.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCoinRules(rules = {}) {
  const errors = {};

  const numberFields = [
    "newUserBonus",
    "dailyLoginCoins",
    "rewardedAdCoins",
    "scratchMinCoins",
    "scratchMaxCoins",
    "referralBonus",
    "requiredReferralEarnCoins",
    "profileCompleteCoins",
    "maxDailyCoins",
    "maxCoinsPerTask",
  ];

  numberFields.forEach((field) => {
    const value = Number(rules[field] || 0);

    if (!Number.isFinite(value) || value < 0) {
      errors[field] = "Value cannot be negative.";
    }
  });

  if (Number(rules.scratchMaxCoins || 0) < Number(rules.scratchMinCoins || 0)) {
    errors.scratchMaxCoins =
      "Scratch max coins must be greater than or equal to min coins.";
  }

  if (Number(rules.requiredReferralEarnCoins || 0) <= 0) {
    errors.requiredReferralEarnCoins =
      "Required referral earning coins must be greater than 0.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}