import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  BadgeIndianRupee,
  Video,
  ShieldAlert,
} from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function AdsRewards() {
  const [settings, setSettings] = useState({
    adsRewardEnabled: true,
    rewardedAdsEnabled: true,
    rewardedAdCoins: 5,
    maxDailyAds: 10,

    interstitialEnabled: true,
    bannerEnabled: true,
    testAdsMode: true,

    rewardAfterFullWatch: true,
    failedAdReward: false,
    adCooldownSeconds: 30,

    admobRewardedId: "",
    admobInterstitialId: "",
    admobBannerId: "",
  });

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
        rewardedAdsEnabled:
          data.rewardedAdsEnabled ?? data.adsRewardEnabled ?? current.rewardedAdsEnabled,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load ads reward settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function isValidAdMobId(value) {
    if (!value) return true;
    return /^ca-app-pub-\d{16}\/\d{10}$/.test(String(value).trim());
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const rewardedAdCoins = toNumber(settings.rewardedAdCoins, 5);
    const maxDailyAds = toNumber(settings.maxDailyAds, 10);
    const adCooldownSeconds = toNumber(settings.adCooldownSeconds, 30);

    if (rewardedAdCoins <= 0) {
      setError("Rewarded ad coins must be greater than 0.");
      return;
    }

    if (maxDailyAds <= 0) {
      setError("Max daily ads must be greater than 0.");
      return;
    }

    if (adCooldownSeconds < 0) {
      setError("Ad cooldown seconds cannot be negative.");
      return;
    }

    if (!settings.rewardAfterFullWatch) {
      setError("Reward must be given only after full ad watch for safety.");
      return;
    }

    if (settings.failedAdReward) {
      setError("Failed ad reward should stay disabled to prevent abuse.");
      return;
    }

    if (!settings.testAdsMode) {
      if (
        !settings.admobRewardedId.trim() ||
        !settings.admobInterstitialId.trim() ||
        !settings.admobBannerId.trim()
      ) {
        setError("Real AdMob IDs are required when test ads mode is OFF.");
        return;
      }
    }

    if (
      !isValidAdMobId(settings.admobRewardedId) ||
      !isValidAdMobId(settings.admobInterstitialId) ||
      !isValidAdMobId(settings.admobBannerId)
    ) {
      setError("AdMob ID format looks invalid. Example: ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        adsRewardEnabled: !!settings.adsRewardEnabled,
        rewardedAdsEnabled: !!settings.rewardedAdsEnabled,

        interstitialEnabled: !!settings.interstitialEnabled,
        bannerEnabled: !!settings.bannerEnabled,
        testAdsMode: !!settings.testAdsMode,

        rewardAfterFullWatch: true,
        failedAdReward: false,

        rewardedAdCoins,
        maxDailyAds,
        adCooldownSeconds,

        admobRewardedId: settings.admobRewardedId.trim(),
        admobInterstitialId: settings.admobInterstitialId.trim(),
        admobBannerId: settings.admobBannerId.trim(),
      });

      setMessage("Ads reward settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save ads reward settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading ads rewards..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Ads Rewards</h2>
          <p>Control rewarded ads, daily limits and AdMob placement IDs.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RotateCcw size={18} />
          Reload
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Reward Per Ad"
          value={settings.rewardedAdCoins || 0}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Daily Ad Limit"
          value={settings.maxDailyAds || 0}
          icon={Video}
        />

        <StatCard
          title="Ads Status"
          value={settings.adsRewardEnabled ? "ON" : "OFF"}
          icon={Video}
          variant={settings.adsRewardEnabled ? "success" : "danger"}
        />

        <StatCard
          title="Test Mode"
          value={settings.testAdsMode ? "ON" : "OFF"}
          icon={ShieldAlert}
          variant={settings.testAdsMode ? "warning" : "success"}
        />
      </div>

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="settings-section">
            <div className="section-title">
              <Video size={18} />
              <h3>Rewarded Ads Control</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="adsRewardEnabled"
                    checked={!!settings.adsRewardEnabled}
                    onChange={handleChange}
                  />
                  Enable ads rewards module
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="rewardedAdsEnabled"
                    checked={!!settings.rewardedAdsEnabled}
                    onChange={handleChange}
                  />
                  Enable rewarded ads
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="interstitialEnabled"
                    checked={!!settings.interstitialEnabled}
                    onChange={handleChange}
                  />
                  Enable interstitial ads
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="bannerEnabled"
                    checked={!!settings.bannerEnabled}
                    onChange={handleChange}
                  />
                  Enable banner ads
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="testAdsMode"
                    checked={!!settings.testAdsMode}
                    onChange={handleChange}
                  />
                  Test ads mode
                </label>
                <small>Keep ON during development.</small>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Coins Per Rewarded Ad</label>
                <input
                  type="number"
                  name="rewardedAdCoins"
                  value={settings.rewardedAdCoins}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Maximum Ads Per Day</label>
                <input
                  type="number"
                  name="maxDailyAds"
                  value={settings.maxDailyAds}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Ad Cooldown Seconds</label>
                <input
                  type="number"
                  name="adCooldownSeconds"
                  value={settings.adCooldownSeconds}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Reward Rule</label>
                <select
                  name="rewardAfterFullWatch"
                  value={settings.rewardAfterFullWatch ? "true" : "false"}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      rewardAfterFullWatch: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Reward after full ad watched</option>
                  <option value="false">Reward after ad loaded</option>
                </select>
              </div>
            </div>

            <div className="warning-box">
              <ShieldAlert size={18} />
              Best safe rule: reward only after full rewarded video is completed.
              Do not reward failed ads, otherwise users can abuse coins.
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Video size={18} />
              <h3>AdMob Unit IDs</h3>
            </div>

            <div className="form-row">
              <label>AdMob Rewarded Ad Unit ID</label>
              <input
                type="text"
                name="admobRewardedId"
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                value={settings.admobRewardedId}
                onChange={handleChange}
              />
              <small>Keep empty during development if test ads mode is ON.</small>
            </div>

            <div className="form-row">
              <label>AdMob Interstitial Ad Unit ID</label>
              <input
                type="text"
                name="admobInterstitialId"
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                value={settings.admobInterstitialId}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>AdMob Banner Ad Unit ID</label>
              <input
                type="text"
                name="admobBannerId"
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                value={settings.admobBannerId}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Ads Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdsRewards;