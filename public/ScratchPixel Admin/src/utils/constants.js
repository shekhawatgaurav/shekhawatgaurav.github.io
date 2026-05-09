export const APP_NAME = "Scratch Pixel";

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
  SUSPENDED: "suspended",
};

export const RISK_STATUS = {
  NORMAL: "normal",
  SUSPICIOUS: "suspicious",
  HIGH_RISK: "high-risk",
};

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
};

export const KYC_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const REFERRAL_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

export const SUPPORT_STATUS = {
  OPEN: "open",
  REPLIED: "replied",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export const TASK_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
};

export const NOTIFICATION_STATUS = {
  SENT: "sent",
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const ADMIN_ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  FINANCE: "finance",
  SUPPORT: "support",
};

export const PAYMENT_METHODS = {
  UPI: "upi",
  PAYTM: "paytm",
  BANK: "bank",
  GIFT_CARD: "gift-card",
};

export const COLLECTIONS = {
  ADMINS: "admins",
  USERS: "users",
  WITHDRAWALS: "withdrawals",
  KYC_REQUESTS: "kycRequests",
  SETTINGS: "settings",
  WALLET_TRANSACTIONS: "walletTransactions",
  AUDIT_LOGS: "auditLogs",
  NOTIFICATIONS: "notifications",
  FRAUD_REPORTS: "fraudReports",
  REFERRALS: "referrals",
  TASKS: "tasks",
  SUPPORT_TICKETS: "supportTickets",
  SUPPORT_REPLIES: "supportReplies",
  BANNERS: "banners",
  ACCOUNT_DELETION_REQUESTS: "accountDeletionRequests",

  // Legacy only. New scratch settings are saved in settings/main.
  SCRATCH_RULES: "scratchRules",
};

export const DEFAULT_SETTINGS = {
  appName: APP_NAME,
  tagline: "Scratch daily and earn rewards",

  maintenanceMode: false,
  walletEnabled: true,
  redeemEnabled: true,

  scratchEnabled: true,
  freeScratchPerDay: 1,
  scratchMinCoins: 1,
  scratchMaxCoins: 20,

  referralEnabled: true,
  referralBonus: 25,
  newUserReferralBonus: 0,
  requiredReferralEarnCoins: 100,
  referralRuleText:
    "You earn referral coins when your friend earns the required coins in the app.",

  adsRewardEnabled: true,
  rewardedAdCoins: 5,
  maxDailyAds: 10,
  adCooldownSeconds: 30,
  bannerEnabled: true,
  interstitialEnabled: true,
  testAdsMode: true,

  newUserBonus: 10,
  dailyLoginCoins: 2,
  profileCompleteCoins: 10,
  maxDailyCoins: 500,
  maxCoinsPerTask: 100,

  coinValue: 100,
  minWithdrawal: 50,
  maxWalletCoins: 100000,
  allowNegativeWallet: false,
  showRupeeEquivalent: true,
  allowManualAdjustment: true,

  kycRequired: true,
  kycBeforeWithdrawal: true,
  allowPanKyc: true,
  allowAadhaarKyc: false,
  requireSelfie: false,
  allowKycResubmitAfterApproval: false,
  kycReviewTime: "24-72 hours",

  paymentMode: "manual",
  processingTime: "24-72 hours",
  payoutNote: "Withdrawals are reviewed manually before payment.",
  upiWarningText:
    "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",

  walletNote:
    "Coins are virtual reward points. Redemption is subject to review and app rules.",
  coinRulesNote:
    "Coins are controlled by daily limits and fraud checks. Rewards may change anytime.",

  fraudRulesEnabled: true,
  blockMultipleAccountsSameDevice: true,
  flagSameUpiMultipleUsers: true,
  flagVpnUsers: true,
  flagEmulatorUsers: true,
  flagHighCoinsJump: true,
  flagReferralAbuse: true,
  autoBlockHighRisk: false,
  withdrawalRiskReviewRequired: true,

  // old confusing field disabled
  maxDailyEarning: null,
};
