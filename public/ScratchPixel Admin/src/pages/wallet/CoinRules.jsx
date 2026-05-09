import { useEffect, useState } from "react";
import { Save, RefreshCcw, Coins, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function CoinRules() {
  const [rules, setRules] = useState({
    newUserBonus: 10,
    dailyLoginCoins: 2,
    rewardedAdCoins: 5,
    scratchMinCoins: 1,
    scratchMaxCoins: 20,
    referralBonus: 25,
    requiredReferralEarnCoins: 100,
    profileCompleteCoins: 10,
    maxDailyCoins: 500,
    maxCoinsPerTask: 100,
    allowNegativeWallet: false,
    coinRulesNote:
      "Coins are controlled by daily limits and fraud checks. Rewards may change anytime.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async function loadRules() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAppSettings();

      setRules((current) => ({
        ...current,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load coin rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function handleInput(e) {
    const { name, value } = e.target;

    setRules((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCheckbox(e) {
    const { name, checked } = e.target;

    setRules((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const newUserBonus = toNumber(rules.newUserBonus, 10);
    const dailyLoginCoins = toNumber(rules.dailyLoginCoins, 2);
    const rewardedAdCoins = toNumber(rules.rewardedAdCoins, 5);
    const scratchMinCoins = toNumber(rules.scratchMinCoins, 1);
    const scratchMaxCoins = toNumber(rules.scratchMaxCoins, 20);
    const referralBonus = toNumber(rules.referralBonus, 25);
    const requiredReferralEarnCoins = toNumber(
      rules.requiredReferralEarnCoins,
      100
    );
    const profileCompleteCoins = toNumber(rules.profileCompleteCoins, 10);
    const maxDailyCoins = toNumber(rules.maxDailyCoins, 500);
    const maxCoinsPerTask = toNumber(rules.maxCoinsPerTask, 100);

    if (
      newUserBonus < 0 ||
      dailyLoginCoins < 0 ||
      rewardedAdCoins < 0 ||
      scratchMinCoins < 0 ||
      scratchMaxCoins < 0 ||
      referralBonus < 0 ||
      requiredReferralEarnCoins < 0 ||
      profileCompleteCoins < 0 ||
      maxDailyCoins < 0 ||
      maxCoinsPerTask < 0
    ) {
      setError("Coin values cannot be negative.");
      return;
    }

    if (scratchMaxCoins < scratchMinCoins) {
      setError("Scratch max coins must be greater than or equal to min coins.");
      return;
    }

    if (requiredReferralEarnCoins <= 0) {
      setError("Required referral earning coins must be greater than 0.");
      return;
    }

    if (maxDailyCoins <= 0) {
      setError("Max daily coins must be greater than 0.");
      return;
    }

    if (maxCoinsPerTask <= 0) {
      setError("Max coins per task must be greater than 0.");
      return;
    }

    if (maxCoinsPerTask < profileCompleteCoins) {
      setError("Max coins per task cannot be lower than profile complete coins.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...rules,

        newUserBonus,
        dailyLoginCoins,
        rewardedAdCoins,

        scratchMinCoins,
        scratchMaxCoins,

        referralBonus,
        requiredReferralEarnCoins,

        profileCompleteCoins,
        maxDailyCoins,
        maxCoinsPerTask,

        allowNegativeWallet: !!rules.allowNegativeWallet,

        coinRulesNote:
          String(rules.coinRulesNote || "").trim() ||
          "Coins are controlled by daily limits and fraud checks. Rewards may change anytime.",
      });

      setMessage("Coin rules saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save coin rules.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading coin rules..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Coin Rules</h2>
          <p>
            Set coin rewards for signup, login, ads, scratch, referrals and
            profile tasks.
          </p>
        </div>

        <Button variant="secondary" onClick={loadRules}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        Keep daily coin limits strict. High rewards without ad revenue can
        create payout loss.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Coins size={18} />
              <h3>Basic Rewards</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>New User Bonus</label>
                <input
                  type="number"
                  min="0"
                  name="newUserBonus"
                  value={rules.newUserBonus}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Daily Login Coins</label>
                <input
                  type="number"
                  min="0"
                  name="dailyLoginCoins"
                  value={rules.dailyLoginCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Rewarded Ad Coins</label>
                <input
                  type="number"
                  min="0"
                  name="rewardedAdCoins"
                  value={rules.rewardedAdCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Profile Complete Coins</label>
                <input
                  type="number"
                  min="0"
                  name="profileCompleteCoins"
                  value={rules.profileCompleteCoins}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Coins size={18} />
              <h3>Scratch Coin Range</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Scratch Minimum Coins</label>
                <input
                  type="number"
                  min="0"
                  name="scratchMinCoins"
                  value={rules.scratchMinCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Scratch Maximum Coins</label>
                <input
                  type="number"
                  min="0"
                  name="scratchMaxCoins"
                  value={rules.scratchMaxCoins}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Coins size={18} />
              <h3>Referral Rewards</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Referral Bonus Coins</label>
                <input
                  type="number"
                  min="0"
                  name="referralBonus"
                  value={rules.referralBonus}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Friend Required Earning Coins</label>
                <input
                  type="number"
                  min="1"
                  name="requiredReferralEarnCoins"
                  value={rules.requiredReferralEarnCoins}
                  onChange={handleInput}
                />
                <small>
                  Referrer gets reward only after friend earns this many coins.
                </small>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <ShieldAlert size={18} />
              <h3>Coin Limits</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Max Daily Coins</label>
                <input
                  type="number"
                  min="1"
                  name="maxDailyCoins"
                  value={rules.maxDailyCoins}
                  onChange={handleInput}
                />
                <small>
                  Used for fraud/risk checks. App claim limits are controlled by
                  feature-specific settings.
                </small>
              </div>

              <div className="form-row">
                <label>Max Coins Per Task</label>
                <input
                  type="number"
                  min="1"
                  name="maxCoinsPerTask"
                  value={rules.maxCoinsPerTask}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowNegativeWallet"
                    checked={!!rules.allowNegativeWallet}
                    onChange={handleCheckbox}
                  />
                  Allow negative wallet
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Coins size={18} />
              <h3>Note</h3>
            </div>

            <div className="form-row">
              <label>Coin Rules Note</label>
              <textarea
                name="coinRulesNote"
                value={rules.coinRulesNote}
                onChange={handleInput}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Coin Rules
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CoinRules;