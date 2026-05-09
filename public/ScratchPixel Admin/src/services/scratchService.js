import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_ID = "main";

const DEFAULT_SCRATCH_SETTINGS = {
  scratchEnabled: true,
  freeScratchPerDay: 1,
  scratchMinCoins: 1,
  scratchMaxCoins: 20,

  scratchResetText: "Resets daily at midnight",
  scratchRewardTitle: "You won!",
  scratchRewardSubtitle: "Coins have been added to your wallet.",
  scratchNote:
    "Scratch daily to earn random coins. Rewards may change anytime.",
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

export async function getScratchRules() {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        ...DEFAULT_SCRATCH_SETTINGS,
        enabled: DEFAULT_SCRATCH_SETTINGS.scratchEnabled,
        minCoins: DEFAULT_SCRATCH_SETTINGS.scratchMinCoins,
        maxCoins: DEFAULT_SCRATCH_SETTINGS.scratchMaxCoins,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      ...DEFAULT_SCRATCH_SETTINGS,
      enabled: DEFAULT_SCRATCH_SETTINGS.scratchEnabled,
      minCoins: DEFAULT_SCRATCH_SETTINGS.scratchMinCoins,
      maxCoins: DEFAULT_SCRATCH_SETTINGS.scratchMaxCoins,
    };
  }

  const data = snap.data();

  const scratchEnabled = toBoolean(
    data.scratchEnabled ?? data.enabled,
    DEFAULT_SCRATCH_SETTINGS.scratchEnabled
  );

  const scratchMinCoins = toNumber(
    data.scratchMinCoins ?? data.minCoins,
    DEFAULT_SCRATCH_SETTINGS.scratchMinCoins
  );

  const scratchMaxCoins = toNumber(
    data.scratchMaxCoins ?? data.maxCoins,
    DEFAULT_SCRATCH_SETTINGS.scratchMaxCoins
  );

  return {
    scratchEnabled,
    freeScratchPerDay: toNumber(
      data.freeScratchPerDay,
      DEFAULT_SCRATCH_SETTINGS.freeScratchPerDay
    ),
    scratchMinCoins,
    scratchMaxCoins,

    scratchResetText: toText(
      data.scratchResetText,
      DEFAULT_SCRATCH_SETTINGS.scratchResetText
    ),
    scratchRewardTitle: toText(
      data.scratchRewardTitle,
      DEFAULT_SCRATCH_SETTINGS.scratchRewardTitle
    ),
    scratchRewardSubtitle: toText(
      data.scratchRewardSubtitle,
      DEFAULT_SCRATCH_SETTINGS.scratchRewardSubtitle
    ),
    scratchNote: toText(
      data.scratchNote,
      DEFAULT_SCRATCH_SETTINGS.scratchNote
    ),

    // legacy compatibility
    enabled: scratchEnabled,
    minCoins: scratchMinCoins,
    maxCoins: scratchMaxCoins,
  };
}

export async function updateScratchRules(rules = {}) {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_ID);

  const scratchEnabled = toBoolean(
    rules.scratchEnabled ?? rules.enabled,
    DEFAULT_SCRATCH_SETTINGS.scratchEnabled
  );

  const freeScratchPerDay = toNumber(
    rules.freeScratchPerDay,
    DEFAULT_SCRATCH_SETTINGS.freeScratchPerDay
  );

  const scratchMinCoins = toNumber(
    rules.scratchMinCoins ?? rules.minCoins,
    DEFAULT_SCRATCH_SETTINGS.scratchMinCoins
  );

  const scratchMaxCoins = toNumber(
    rules.scratchMaxCoins ?? rules.maxCoins,
    DEFAULT_SCRATCH_SETTINGS.scratchMaxCoins
  );

  if (freeScratchPerDay <= 0) {
    throw new Error("Free scratch per day must be at least 1.");
  }

  if (scratchMinCoins < 0 || scratchMaxCoins < 0) {
    throw new Error("Scratch coins cannot be negative.");
  }

  if (scratchMinCoins > scratchMaxCoins) {
    throw new Error("Scratch minimum coins cannot be greater than maximum coins.");
  }

  await setDoc(
    ref,
    {
      scratchEnabled,
      freeScratchPerDay,
      scratchMinCoins,
      scratchMaxCoins,

      scratchResetText: toText(
        rules.scratchResetText,
        DEFAULT_SCRATCH_SETTINGS.scratchResetText
      ),

      scratchRewardTitle: toText(
        rules.scratchRewardTitle,
        DEFAULT_SCRATCH_SETTINGS.scratchRewardTitle
      ),

      scratchRewardSubtitle: toText(
        rules.scratchRewardSubtitle,
        DEFAULT_SCRATCH_SETTINGS.scratchRewardSubtitle
      ),

      scratchNote: toText(
        rules.scratchNote,
        DEFAULT_SCRATCH_SETTINGS.scratchNote
      ),

      // legacy compatibility
      enabled: scratchEnabled,
      minCoins: scratchMinCoins,
      maxCoins: scratchMaxCoins,

      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}