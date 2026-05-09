import { useEffect, useState } from "react";
import { Save, AlertTriangle, RefreshCcw, Megaphone } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function AdSettings() {
  const [settings, setSettings] = useState({
    showAdsOnHome: true,
    showAdsOnScratch: true,
    showAdsOnWithdraw: false,
    showAdsOnTasks: true,
    showAdsOnReferral: true,
    showAdsOnWalletActivity: false,

    testAdsMode: true,
    rewardedAdsEnabled: true,
    bannerEnabled: true,
    interstitialEnabled: true,
    appOpenAdsEnabled: false,
    nativeAdsEnabled: false,

    rewardedAdCoins: 5,
    maxDailyAds: 10,
    adCooldownSeconds: 30,
    suspiciousAdWatchLimit: 30,
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
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load ad settings.");
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

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const rewardedAdCoins = toNumber(settings.rewardedAdCoins, 5);
    const maxDailyAds = toNumber(settings.maxDailyAds, 10);
    const adCooldownSeconds = toNumber(settings.adCooldownSeconds, 30);
    const suspiciousAdWatchLimit = toNumber(settings.suspiciousAdWatchLimit, 30);

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

    if (suspiciousAdWatchLimit < maxDailyAds) {
      setError("Suspicious watch limit should be equal or higher than max daily ads.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        showAdsOnHome: !!settings.showAdsOnHome,
        showAdsOnScratch: !!settings.showAdsOnScratch,
        showAdsOnWithdraw: !!settings.showAdsOnWithdraw,
        showAdsOnTasks: !!settings.showAdsOnTasks,
        showAdsOnReferral: !!settings.showAdsOnReferral,
        showAdsOnWalletActivity: !!settings.showAdsOnWalletActivity,

        testAdsMode: !!settings.testAdsMode,
        rewardedAdsEnabled: !!settings.rewardedAdsEnabled,
        bannerEnabled: !!settings.bannerEnabled,
        interstitialEnabled: !!settings.interstitialEnabled,
        appOpenAdsEnabled: !!settings.appOpenAdsEnabled,
        nativeAdsEnabled: !!settings.nativeAdsEnabled,

        rewardedAdCoins,
        maxDailyAds,
        adCooldownSeconds,
        suspiciousAdWatchLimit,
      });

      setMessage("Ad settings updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to update ad settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading ad settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Ad Settings</h2>
          <p>Manage ad placements, test mode, limits and abuse detection.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="warning-box">
        <AlertTriangle size={18} />
        Keep test ads ON during development. Turn it OFF only after adding real
        AdMob IDs and before production release.
      </div>

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Megaphone size={18} />
              <h3>Ad Placements</h3>
            </div>

            <div className="grid grid-2">
              {[
                ["showAdsOnHome", "Show banner ads on Home"],
                ["showAdsOnScratch", "Show banner ads on Scratch page"],
                ["showAdsOnWithdraw", "Show banner ads on Withdraw page"],
                ["showAdsOnTasks", "Show banner ads on Tasks page"],
                ["showAdsOnReferral", "Show banner ads on Referral page"],
                ["showAdsOnWalletActivity", "Show banner ads on Wallet Activity"],
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
              <Megaphone size={18} />
              <h3>Ad Types</h3>
            </div>

            <div className="grid grid-2">
              {[
                ["testAdsMode", "Test ads mode"],
                ["rewardedAdsEnabled", "Rewarded ads"],
                ["bannerEnabled", "Banner ads"],
                ["interstitialEnabled", "Interstitial ads"],
                ["appOpenAdsEnabled", "App open ads"],
                ["nativeAdsEnabled", "Native ads"],
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
              <Megaphone size={18} />
              <h3>Limits & Fraud Control</h3>
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
                <label>Max Daily Ads</label>
                <input
                  type="number"
                  name="maxDailyAds"
                  value={settings.maxDailyAds}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Ad Cooldown Seconds</label>
                <input
                  type="number"
                  name="adCooldownSeconds"
                  value={settings.adCooldownSeconds}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Suspicious Watch Limit</label>
                <input
                  type="number"
                  name="suspiciousAdWatchLimit"
                  value={settings.suspiciousAdWatchLimit}
                  onChange={handleInput}
                />
                <small>User can be flagged if ad watch count crosses this.</small>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Ad Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdSettings;