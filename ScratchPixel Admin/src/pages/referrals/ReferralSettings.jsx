import { useEffect, useState } from "react";
import { Save, RefreshCcw, Gift, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function ReferralSettings() {
  const [settings, setSettings] = useState({
    referralEnabled: true,
    referralBonus: 25,
    newUserReferralBonus: 0,
    requiredReferralEarnCoins: 100,

    maxReferralPerDay: 10,
    maxReferralPerUser: 100,

    blockSameDeviceReferral: true,
    blockSameUpiReferral: true,
    flagReferralAbuse: true,

    referralRuleText:
      "You earn referral coins when your friend earns the required coins in the app.",
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
        referralRuleText:
          data.referralRuleText ||
          data.referralText ||
          current.referralRuleText,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load referral settings.");
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

    const referralBonus = toNumber(settings.referralBonus, 25);
    const newUserReferralBonus = toNumber(settings.newUserReferralBonus, 0);
    const requiredReferralEarnCoins = toNumber(
      settings.requiredReferralEarnCoins,
      100
    );
    const maxReferralPerDay = toNumber(settings.maxReferralPerDay, 10);
    const maxReferralPerUser = toNumber(settings.maxReferralPerUser, 100);

    if (referralBonus < 0) {
      setError("Referral bonus cannot be negative.");
      return;
    }

    if (newUserReferralBonus < 0) {
      setError("New user referral bonus cannot be negative.");
      return;
    }

    if (requiredReferralEarnCoins <= 0) {
      setError("Friend required earning coins must be greater than 0.");
      return;
    }

    if (maxReferralPerDay < 0 || maxReferralPerUser < 0) {
      setError("Referral limits cannot be negative. Use 0 for no strict limit.");
      return;
    }

    if (
      maxReferralPerDay > 0 &&
      maxReferralPerUser > 0 &&
      maxReferralPerUser < maxReferralPerDay
    ) {
      setError("Max referrals per user cannot be lower than daily referral limit.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        referralEnabled: !!settings.referralEnabled,

        blockSameDeviceReferral: !!settings.blockSameDeviceReferral,
        blockSameUpiReferral: !!settings.blockSameUpiReferral,
        flagReferralAbuse: !!settings.flagReferralAbuse,

        referralBonus,
        newUserReferralBonus,
        requiredReferralEarnCoins,
        maxReferralPerDay,
        maxReferralPerUser,

        referralRuleText:
          settings.referralRuleText?.trim() ||
          "You earn referral coins when your friend earns the required coins in the app.",

        // old instant reward fields disabled because app now uses requiredReferralEarnCoins
        rewardAfterSignup: false,
        rewardAfterFirstScratch: false,
        rewardAfterFirstAd: false,
      });

      setMessage("Referral settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save referral settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading referral settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Referral Settings</h2>
          <p>Control invite rewards, unlock conditions and referral fraud rules.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <Gift size={18} />
        Recommended rule: reward the referrer only after the friend earns the
        required coins. This reduces fake signup referrals.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>Referral Rewards</h3>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="referralEnabled"
                  checked={!!settings.referralEnabled}
                  onChange={handleCheckbox}
                />
                Enable referral system
              </label>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Referrer Bonus Coins</label>
                <input
                  type="number"
                  name="referralBonus"
                  value={settings.referralBonus}
                  onChange={handleInput}
                />
                <small>Coins credited to the old user/referrer.</small>
              </div>

              <div className="form-row">
                <label>New User Referral Bonus Coins</label>
                <input
                  type="number"
                  name="newUserReferralBonus"
                  value={settings.newUserReferralBonus}
                  onChange={handleInput}
                />
                <small>Optional. Use 0 if not needed.</small>
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
                  Referrer gets bonus when friend earns this many coins.
                </small>
              </div>
            </div>

            <div className="form-row">
              <label>Referral Rule Text Shown in App</label>
              <textarea
                name="referralRuleText"
                value={settings.referralRuleText}
                onChange={handleInput}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <ShieldAlert size={18} />
              <h3>Limits & Fraud Protection</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Max Referrals Per Day</label>
                <input
                  type="number"
                  name="maxReferralPerDay"
                  value={settings.maxReferralPerDay}
                  onChange={handleInput}
                />
                <small>Use 0 for no strict limit.</small>
              </div>

              <div className="form-row">
                <label>Max Referrals Per User</label>
                <input
                  type="number"
                  name="maxReferralPerUser"
                  value={settings.maxReferralPerUser}
                  onChange={handleInput}
                />
                <small>Use 0 for no strict limit.</small>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="blockSameDeviceReferral"
                    checked={!!settings.blockSameDeviceReferral}
                    onChange={handleCheckbox}
                  />
                  Block same device referrals
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="blockSameUpiReferral"
                    checked={!!settings.blockSameUpiReferral}
                    onChange={handleCheckbox}
                  />
                  Block same UPI referrals
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="flagReferralAbuse"
                    checked={!!settings.flagReferralAbuse}
                    onChange={handleCheckbox}
                  />
                  Flag referral abuse
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Referral Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ReferralSettings;