import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_ID = "main";

export const DEFAULT_APP_SETTINGS = {
  appName: "Scratch Pixel",
  tagline: "Scratch daily and earn rewards",
  supportEmail: "",

  maintenanceMode: false,
  appMaintenanceMessage: "App is under maintenance. Please try again later.",

  forceUpdate: false,
  currentAppVersion: "1.0.0",
  minimumAppVersion: "1.0.0",
  updateTitle: "New update available",
  updateMessage: "Please update the app to continue using rewards.",
  playStoreUrl: "",

  walletEnabled: true,
  redeemEnabled: true,
  scratchEnabled: true,
  referralEnabled: true,
  adsRewardEnabled: true,
  tasksEnabled: true,

  kycRequired: true,
  kycBeforeWithdrawal: true,

  coinValue: 100,
  minWithdrawal: 50,
  maxWalletCoins: 100000,
  allowNegativeWallet: false,
  showRupeeEquivalent: true,
  allowManualAdjustment: true,

  newUserBonus: 10,
  dailyLoginCoins: 2,
  profileCompleteCoins: 10,
  maxDailyCoins: 500,
  maxCoinsPerTask: 100,

  freeScratchPerDay: 1,
  scratchMinCoins: 1,
  scratchMaxCoins: 20,

  rewardedAdCoins: 5,
  maxDailyAds: 10,
  adCooldownSeconds: 30,
  bannerEnabled: true,
  interstitialEnabled: true,
  testAdsMode: true,
  admobRewardedId: "",
  admobBannerId: "",
  admobInterstitialId: "",

  maxDailyTaskClaims: 5,

  referralBonus: 25,
  newUserReferralBonus: 0,
  requiredReferralEarnCoins: 100,
  referralRuleText:
    "You earn referral coins when your friend completes the required earning target.",

  paymentMode: "manual",
  allowUpi: true,
  allowGiftCard: false,
  allowRecharge: false,
  maxWithdrawalPerDay: 100,
  maxWithdrawalPerWeek: 500,
  processingTime: "24-72 hours",
  paymentNote:
    "Withdrawals are reviewed by admin before payment is processed.",
  payoutNote: "Withdrawals are reviewed manually before payment.",
  upiWarningText:
    "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",

  coinExpiryEnabled: false,
  coinExpiryDays: 365,
  walletNote:
    "Coins are virtual reward points. Redemption is subject to review and app rules.",
  coinRulesNote:
    "Coins are controlled by daily limits and fraud checks. Rewards may change anytime.",

  oneDeviceOneAccount: true,
  blockVpn: false,
  blockEmulator: true,
  requireEmailVerified: false,
  requirePhoneVerified: false,

  adminLoginAudit: true,
  autoLogoutMinutes: 60,
  maxLoginAttempts: 5,
  suspiciousLoginAlert: true,

  fraudRulesEnabled: true,
  blockMultipleAccountsSameDevice: true,
  flagSameUpiMultipleUsers: true,
  flagVpnUsers: true,
  flagEmulatorUsers: true,
  flagHighCoinsJump: true,
  flagReferralAbuse: true,
  autoBlockHighRisk: false,
  withdrawalRiskReviewRequired: true,

  deleteAccountEnabled: true,
  deleteAccountRequiresAdminApproval: true,
  accountDeletePolicyText:
    "Account deletion requests are reviewed by admin before final action.",

  allowPanKyc: true,
  allowAadhaarKyc: false,
  requireSelfie: false,
  allowKycResubmitAfterApproval: false,
  kycReviewTime: "24-72 hours",

  primaryColor: "#7C3AED",
  accentColor: "#FFB020",
  backgroundColor: "#F5F6FA",
  cardColor: "#FFFFFF",
  surfaceColor: "#F3F4F6",
  mutedColor: "#6B7280",

  maxDailyEarning: null,
  updatedAt: null,
};

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function toText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,

    appName: toText(settings.appName, DEFAULT_APP_SETTINGS.appName),
    tagline: toText(settings.tagline, DEFAULT_APP_SETTINGS.tagline),
    supportEmail: toText(settings.supportEmail, ""),

    maintenanceMode: toBoolean(settings.maintenanceMode, false),
    appMaintenanceMessage: toText(
      settings.appMaintenanceMessage,
      DEFAULT_APP_SETTINGS.appMaintenanceMessage
    ),

    forceUpdate: toBoolean(settings.forceUpdate, false),
    currentAppVersion: toText(settings.currentAppVersion, "1.0.0"),
    minimumAppVersion: toText(settings.minimumAppVersion, "1.0.0"),
    updateTitle: toText(settings.updateTitle, DEFAULT_APP_SETTINGS.updateTitle),
    updateMessage: toText(
      settings.updateMessage,
      DEFAULT_APP_SETTINGS.updateMessage
    ),
    playStoreUrl: toText(settings.playStoreUrl, ""),

    walletEnabled: toBoolean(settings.walletEnabled, true),
    redeemEnabled: toBoolean(settings.redeemEnabled, true),
    scratchEnabled: toBoolean(settings.scratchEnabled, true),
    referralEnabled: toBoolean(settings.referralEnabled, true),
    adsRewardEnabled: toBoolean(settings.adsRewardEnabled, true),
    tasksEnabled: toBoolean(settings.tasksEnabled, true),

    kycRequired: toBoolean(settings.kycRequired, true),
    kycBeforeWithdrawal: toBoolean(settings.kycBeforeWithdrawal, true),

    coinValue: toNumber(settings.coinValue, 100),
    minWithdrawal: toNumber(settings.minWithdrawal, 50),
    maxWalletCoins: toNumber(settings.maxWalletCoins, 100000),
    allowNegativeWallet: toBoolean(settings.allowNegativeWallet, false),
    showRupeeEquivalent: toBoolean(settings.showRupeeEquivalent, true),
    allowManualAdjustment: toBoolean(settings.allowManualAdjustment, true),

    newUserBonus: toNumber(settings.newUserBonus, 10),
    dailyLoginCoins: toNumber(settings.dailyLoginCoins, 2),
    profileCompleteCoins: toNumber(settings.profileCompleteCoins, 10),
    maxDailyCoins: toNumber(settings.maxDailyCoins, 500),
    maxCoinsPerTask: toNumber(settings.maxCoinsPerTask, 100),

    freeScratchPerDay: toNumber(settings.freeScratchPerDay, 1),
    scratchMinCoins: toNumber(settings.scratchMinCoins, 1),
    scratchMaxCoins: toNumber(settings.scratchMaxCoins, 20),

    rewardedAdCoins: toNumber(settings.rewardedAdCoins, 5),
    maxDailyAds: toNumber(settings.maxDailyAds, 10),
    adCooldownSeconds: toNumber(settings.adCooldownSeconds, 30),
    bannerEnabled: toBoolean(settings.bannerEnabled, true),
    interstitialEnabled: toBoolean(settings.interstitialEnabled, true),
    testAdsMode: toBoolean(settings.testAdsMode, true),
    admobRewardedId: toText(settings.admobRewardedId, ""),
    admobBannerId: toText(settings.admobBannerId, ""),
    admobInterstitialId: toText(settings.admobInterstitialId, ""),

    maxDailyTaskClaims: toNumber(settings.maxDailyTaskClaims, 5),

    referralBonus: toNumber(settings.referralBonus, 25),
    newUserReferralBonus: toNumber(settings.newUserReferralBonus, 0),
    requiredReferralEarnCoins: toNumber(
      settings.requiredReferralEarnCoins,
      100
    ),
    referralRuleText: toText(
      settings.referralRuleText,
      DEFAULT_APP_SETTINGS.referralRuleText
    ),

    paymentMode: toText(settings.paymentMode, "manual"),
    allowUpi: toBoolean(settings.allowUpi, true),
    allowGiftCard: toBoolean(settings.allowGiftCard, false),
    allowRecharge: toBoolean(settings.allowRecharge, false),
    maxWithdrawalPerDay: toNumber(settings.maxWithdrawalPerDay, 100),
    maxWithdrawalPerWeek: toNumber(settings.maxWithdrawalPerWeek, 500),
    processingTime: toText(settings.processingTime, "24-72 hours"),
    paymentNote: toText(settings.paymentNote, DEFAULT_APP_SETTINGS.paymentNote),
    payoutNote: toText(settings.payoutNote, DEFAULT_APP_SETTINGS.payoutNote),
    upiWarningText: toText(
      settings.upiWarningText,
      DEFAULT_APP_SETTINGS.upiWarningText
    ),

    coinExpiryEnabled: toBoolean(settings.coinExpiryEnabled, false),
    coinExpiryDays: toNumber(settings.coinExpiryDays, 365),
    walletNote: toText(settings.walletNote, DEFAULT_APP_SETTINGS.walletNote),
    coinRulesNote: toText(
      settings.coinRulesNote,
      DEFAULT_APP_SETTINGS.coinRulesNote
    ),

    oneDeviceOneAccount: toBoolean(settings.oneDeviceOneAccount, true),
    blockVpn: toBoolean(settings.blockVpn, false),
    blockEmulator: toBoolean(settings.blockEmulator, true),
    requireEmailVerified: toBoolean(settings.requireEmailVerified, false),
    requirePhoneVerified: toBoolean(settings.requirePhoneVerified, false),

    adminLoginAudit: toBoolean(settings.adminLoginAudit, true),
    autoLogoutMinutes: toNumber(settings.autoLogoutMinutes, 60),
    maxLoginAttempts: toNumber(settings.maxLoginAttempts, 5),
    suspiciousLoginAlert: toBoolean(settings.suspiciousLoginAlert, true),

    fraudRulesEnabled: toBoolean(settings.fraudRulesEnabled, true),
    blockMultipleAccountsSameDevice: toBoolean(
      settings.blockMultipleAccountsSameDevice,
      true
    ),
    flagSameUpiMultipleUsers: toBoolean(
      settings.flagSameUpiMultipleUsers,
      true
    ),
    flagVpnUsers: toBoolean(settings.flagVpnUsers, true),
    flagEmulatorUsers: toBoolean(settings.flagEmulatorUsers, true),
    flagHighCoinsJump: toBoolean(settings.flagHighCoinsJump, true),
    flagReferralAbuse: toBoolean(settings.flagReferralAbuse, true),
    autoBlockHighRisk: toBoolean(settings.autoBlockHighRisk, false),
    withdrawalRiskReviewRequired: toBoolean(
      settings.withdrawalRiskReviewRequired,
      true
    ),

    deleteAccountEnabled: toBoolean(settings.deleteAccountEnabled, true),
    deleteAccountRequiresAdminApproval: toBoolean(
      settings.deleteAccountRequiresAdminApproval,
      true
    ),
    accountDeletePolicyText: toText(
      settings.accountDeletePolicyText,
      DEFAULT_APP_SETTINGS.accountDeletePolicyText
    ),

    allowPanKyc: toBoolean(settings.allowPanKyc, true),
    allowAadhaarKyc: toBoolean(settings.allowAadhaarKyc, false),
    requireSelfie: toBoolean(settings.requireSelfie, false),
    allowKycResubmitAfterApproval: toBoolean(
      settings.allowKycResubmitAfterApproval,
      false
    ),
    kycReviewTime: toText(settings.kycReviewTime, "24-72 hours"),

    primaryColor: toText(settings.primaryColor, "#7C3AED"),
    accentColor: toText(settings.accentColor, "#FFB020"),
    backgroundColor: toText(settings.backgroundColor, "#F5F6FA"),
    cardColor: toText(settings.cardColor, "#FFFFFF"),
    surfaceColor: toText(settings.surfaceColor, "#F3F4F6"),
    mutedColor: toText(settings.mutedColor, "#6B7280"),

    maxDailyEarning: null,
  };
}

export async function getAppSettings() {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const defaultSettings = {
      ...DEFAULT_APP_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, defaultSettings, { merge: true });

    return DEFAULT_APP_SETTINGS;
  }

  return normalizeSettings(snap.data());
}

export async function updateAppSettings(settings = {}) {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_ID);
  const normalized = normalizeSettings(settings);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        ...normalized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return;
  }

  await updateDoc(ref, {
    ...normalized,
    maxDailyEarning: null,
    updatedAt: serverTimestamp(),
  });
}

export async function resetAppSettings() {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_ID);

  await setDoc(
    ref,
    {
      ...DEFAULT_APP_SETTINGS,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}