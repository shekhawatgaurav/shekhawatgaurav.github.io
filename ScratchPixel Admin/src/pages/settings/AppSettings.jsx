import { useEffect, useState } from "react";
import {
  Save,
  RefreshCcw,
  Settings,
  Palette,
  Gift,
  Megaphone,
  Users,
} from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";
import { isValidEmail } from "../../utils/validators";

const DEFAULT_SETTINGS = {
  appName: "Scratch Pixel",
  supportEmail: "",

  maintenanceMode: false,
  scratchEnabled: true,
  redeemEnabled: true,
  referralEnabled: true,
  adsRewardEnabled: true,
  tasksEnabled: true,
  kycRequired: true,

  coinValue: 100,
  minWithdrawal: 50,
  newUserBonus: 10,

  freeScratchPerDay: 1,
  scratchMinCoins: 1,
  scratchMaxCoins: 20,

  rewardedAdCoins: 5,
  maxDailyAds: 10,
  admobRewardedId: "",
  admobBannerId: "",
  admobInterstitialId: "",

  maxDailyTaskClaims: 5,

  referralBonus: 25,
  requiredReferralEarnCoins: 100,
  referralRuleText:
    "You earn referral coins when your friend completes the required earning target.",

  primaryColor: "#7C3AED",
  accentColor: "#FFB020",
  backgroundColor: "#F5F6FA",
  cardColor: "#FFFFFF",
  surfaceColor: "#F3F4F6",
  mutedColor: "#6B7280",
};

function AppSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const data = await getAppSettings();

      setSettings((current) => ({
        ...current,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load app settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleCheckbox(e) {
    const { name, checked } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  function handleInput(e) {
    const { name, value } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function isValidHexColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const coinValue = toNumber(settings.coinValue, 100);
    const minWithdrawal = toNumber(settings.minWithdrawal, 50);
    const newUserBonus = toNumber(settings.newUserBonus, 10);

    const freeScratchPerDay = toNumber(settings.freeScratchPerDay, 1);
    const scratchMin = toNumber(settings.scratchMinCoins, 1);
    const scratchMax = toNumber(settings.scratchMaxCoins, 20);

    const rewardedAdCoins = toNumber(settings.rewardedAdCoins, 5);
    const maxDailyAds = toNumber(settings.maxDailyAds, 10);

    const maxDailyTaskClaims = toNumber(settings.maxDailyTaskClaims, 5);

    const referralBonus = toNumber(settings.referralBonus, 25);
    const requiredReferralEarnCoins = toNumber(
      settings.requiredReferralEarnCoins,
      100
    );

    if (!settings.appName.trim()) {
      setError("App name is required.");
      return;
    }

    if (settings.supportEmail && !isValidEmail(settings.supportEmail)) {
      setError("Please enter a valid support email.");
      return;
    }

    if (coinValue <= 0) {
      setError("Coin value must be greater than 0.");
      return;
    }

    if (minWithdrawal <= 0) {
      setError("Minimum withdrawal must be greater than 0.");
      return;
    }

    if (newUserBonus < 0) {
      setError("New user bonus cannot be negative.");
      return;
    }

    if (scratchMin < 0 || scratchMax < 0) {
      setError("Scratch reward coins cannot be negative.");
      return;
    }

    if (scratchMin > scratchMax) {
      setError("Scratch minimum coins cannot be greater than maximum coins.");
      return;
    }

    if (freeScratchPerDay <= 0) {
      setError("Free scratch per day must be at least 1.");
      return;
    }

    if (rewardedAdCoins < 0 || maxDailyAds < 0) {
      setError("Ad reward values cannot be negative.");
      return;
    }

    if (maxDailyTaskClaims < 0) {
      setError("Max daily task claims cannot be negative.");
      return;
    }

    if (referralBonus < 0) {
      setError("Referral bonus cannot be negative.");
      return;
    }

    if (requiredReferralEarnCoins <= 0) {
      setError("Friend required earning coins must be greater than 0.");
      return;
    }

    const colorFields = [
      ["primaryColor", settings.primaryColor],
      ["accentColor", settings.accentColor],
      ["backgroundColor", settings.backgroundColor],
      ["cardColor", settings.cardColor],
      ["surfaceColor", settings.surfaceColor],
      ["mutedColor", settings.mutedColor],
    ];

    const invalidColor = colorFields.find(([, value]) => !isValidHexColor(value));

    if (invalidColor) {
      setError(`${invalidColor[0]} must be a valid hex color. Example: #7C3AED`);
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        appName: settings.appName.trim(),
        supportEmail: settings.supportEmail.trim(),

        maintenanceMode: !!settings.maintenanceMode,
        scratchEnabled: !!settings.scratchEnabled,
        redeemEnabled: !!settings.redeemEnabled,
        referralEnabled: !!settings.referralEnabled,
        adsRewardEnabled: !!settings.adsRewardEnabled,
        tasksEnabled: !!settings.tasksEnabled,
        kycRequired: !!settings.kycRequired,

        coinValue,
        minWithdrawal,
        newUserBonus,

        freeScratchPerDay,
        scratchMinCoins: scratchMin,
        scratchMaxCoins: scratchMax,

        rewardedAdCoins,
        maxDailyAds,

        admobRewardedId: settings.admobRewardedId || "",
        admobBannerId: settings.admobBannerId || "",
        admobInterstitialId: settings.admobInterstitialId || "",

        maxDailyTaskClaims,

        referralBonus,
        requiredReferralEarnCoins,
        referralRuleText:
          settings.referralRuleText ||
          "You earn referral coins when your friend completes the required earning target.",

        primaryColor: settings.primaryColor || "#7C3AED",
        accentColor: settings.accentColor || "#FFB020",
        backgroundColor: settings.backgroundColor || "#F5F6FA",
        cardColor: settings.cardColor || "#FFFFFF",
        surfaceColor: settings.surfaceColor || "#F3F4F6",
        mutedColor: settings.mutedColor || "#6B7280",
      });

      setMessage("App settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save app settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading app settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>App Settings</h2>
          <p>
            Control app features, rewards, limits, AdMob IDs and app theme.
          </p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Settings size={18} />
              <h3>Basic App Settings</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>App Name</label>
                <input
                  name="appName"
                  value={settings.appName}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Support Email</label>
                <input
                  name="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={handleInput}
                  placeholder="support@example.com"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Settings size={18} />
              <h3>Feature Controls</h3>
            </div>

            <div className="grid grid-2">
              {[
                ["maintenanceMode", "Maintenance Mode"],
                ["scratchEnabled", "Scratch Enabled"],
                ["adsRewardEnabled", "Ads Reward Enabled"],
                ["tasksEnabled", "Tasks Enabled"],
                ["referralEnabled", "Referral Enabled"],
                ["redeemEnabled", "Withdrawals Enabled"],
                ["kycRequired", "KYC Required For Withdrawal"],
              ].map(([name, label]) => (
                <div className="form-row checkbox-row" key={name}>
                  <label>
                    <input
                      type="checkbox"
                      name={name}
                      checked={!!settings[name]}
                      onChange={handleCheckbox}
                    />
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>Wallet & Signup Rewards</h3>
            </div>

            <div className="grid grid-3">
              <div className="form-row">
                <label>Coin Value</label>
                <input
                  type="number"
                  name="coinValue"
                  value={settings.coinValue}
                  onChange={handleInput}
                />
                <small>Example: 100 coins = ₹1</small>
              </div>

              <div className="form-row">
                <label>Minimum Withdrawal ₹</label>
                <input
                  type="number"
                  name="minWithdrawal"
                  value={settings.minWithdrawal}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>New User Bonus Coins</label>
                <input
                  type="number"
                  name="newUserBonus"
                  value={settings.newUserBonus}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>Scratch Settings</h3>
            </div>

            <div className="grid grid-3">
              <div className="form-row">
                <label>Free Scratch Per Day</label>
                <input
                  type="number"
                  name="freeScratchPerDay"
                  value={settings.freeScratchPerDay}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Scratch Min Coins</label>
                <input
                  type="number"
                  name="scratchMinCoins"
                  value={settings.scratchMinCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Scratch Max Coins</label>
                <input
                  type="number"
                  name="scratchMaxCoins"
                  value={settings.scratchMaxCoins}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Megaphone size={18} />
              <h3>AdMob & Rewarded Ads</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Rewarded Ad Coins</label>
                <input
                  type="number"
                  name="rewardedAdCoins"
                  value={settings.rewardedAdCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Max Daily Rewarded Ads</label>
                <input
                  type="number"
                  name="maxDailyAds"
                  value={settings.maxDailyAds}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>AdMob Rewarded Ad Unit ID</label>
                <input
                  name="admobRewardedId"
                  value={settings.admobRewardedId}
                  onChange={handleInput}
                  placeholder="ca-app-pub-xxxxx/yyyyy"
                />
                <small>Keep empty during development to use test ads.</small>
              </div>

              <div className="form-row">
                <label>AdMob Banner Ad Unit ID</label>
                <input
                  name="admobBannerId"
                  value={settings.admobBannerId}
                  onChange={handleInput}
                  placeholder="ca-app-pub-xxxxx/yyyyy"
                />
              </div>

              <div className="form-row">
                <label>AdMob Interstitial Ad Unit ID</label>
                <input
                  name="admobInterstitialId"
                  value={settings.admobInterstitialId}
                  onChange={handleInput}
                  placeholder="ca-app-pub-xxxxx/yyyyy"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>Task Settings</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Max Daily Task Claims</label>
                <input
                  type="number"
                  name="maxDailyTaskClaims"
                  value={settings.maxDailyTaskClaims}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Users size={18} />
              <h3>Referral Settings</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Referral Bonus Coins</label>
                <input
                  type="number"
                  name="referralBonus"
                  value={settings.referralBonus}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Friend Required Earning Coins</label>
                <input
                  type="number"
                  name="requiredReferralEarnCoins"
                  value={settings.requiredReferralEarnCoins}
                  onChange={handleInput}
                />
                <small>
                  Referrer gets bonus only after friend earns this many coins.
                </small>
              </div>
            </div>

            <div className="form-row">
              <label>Referral Rule Text</label>
              <textarea
                name="referralRuleText"
                value={settings.referralRuleText}
                onChange={handleInput}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Palette size={18} />
              <h3>App Theme Colors</h3>
            </div>

            <div className="grid grid-2">
              <ColorInput
                label="Primary Color"
                name="primaryColor"
                value={settings.primaryColor}
                fallback="#7C3AED"
                onChange={handleInput}
                hint="Buttons, navigation and main cards."
              />

              <ColorInput
                label="Accent Color"
                name="accentColor"
                value={settings.accentColor}
                fallback="#FFB020"
                onChange={handleInput}
                hint="Reward highlights and scratch theme."
              />

              <ColorInput
                label="Background Color"
                name="backgroundColor"
                value={settings.backgroundColor}
                fallback="#F5F6FA"
                onChange={handleInput}
                hint="App screen background."
              />

              <ColorInput
                label="Card Color"
                name="cardColor"
                value={settings.cardColor}
                fallback="#FFFFFF"
                onChange={handleInput}
                hint="App card and surface color."
              />

              <ColorInput
                label="Surface / Grey Color"
                name="surfaceColor"
                value={settings.surfaceColor}
                fallback="#F3F4F6"
                onChange={handleInput}
                hint="Light grey cards, boxes and disabled surfaces."
              />

              <ColorInput
                label="Muted Text Color"
                name="mutedColor"
                value={settings.mutedColor}
                fallback="#6B7280"
                onChange={handleInput}
                hint="Secondary text and small labels."
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save App Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

function ColorInput({ label, name, value, fallback, onChange, hint }) {
  const safeValue = value || fallback;

  return (
    <div className="form-row">
      <label>{label}</label>

      <div className="color-input-row">
        <input
          type="color"
          name={name}
          value={safeValue}
          onChange={onChange}
          className="color-picker"
        />

        <input
          type="text"
          name={name}
          value={safeValue}
          onChange={onChange}
          placeholder={fallback}
        />
      </div>

      <small>{hint}</small>
    </div>
  );
}

export default AppSettings;