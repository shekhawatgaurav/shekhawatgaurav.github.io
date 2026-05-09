import { useEffect, useState } from "react";
import { Save, RefreshCcw, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function FraudRules() {
  const [rules, setRules] = useState({
    fraudRulesEnabled: true,
    blockMultipleAccountsSameDevice: true,
    flagSameUpiMultipleUsers: true,
    flagVpnUsers: true,
    flagEmulatorUsers: true,
    flagHighCoinsJump: true,
    flagReferralAbuse: true,
    maxAccountsPerDevice: 1,
    maxUsersPerUpi: 1,
    maxDailyCoinsBeforeFlag: 500,
    maxDailyReferralsBeforeFlag: 10,
    maxDailyAdsBeforeFlag: 30,
    autoBlockHighRisk: false,
    withdrawalRiskReviewRequired: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRules() {
    try {
      setLoading(true);
      setError("");

      const data = await getAppSettings();

      setRules((current) => ({
        ...current,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load fraud rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function handleCheckbox(e) {
    const { name, checked } = e.target;

    setRules((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  function handleInput(e) {
    const { name, value } = e.target;

    setRules((current) => ({
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

    const maxAccountsPerDevice = toNumber(rules.maxAccountsPerDevice, 1);
    const maxUsersPerUpi = toNumber(rules.maxUsersPerUpi, 1);
    const maxDailyCoinsBeforeFlag = toNumber(rules.maxDailyCoinsBeforeFlag, 500);
    const maxDailyReferralsBeforeFlag = toNumber(
      rules.maxDailyReferralsBeforeFlag,
      10
    );
    const maxDailyAdsBeforeFlag = toNumber(rules.maxDailyAdsBeforeFlag, 30);

    if (maxAccountsPerDevice <= 0 || maxUsersPerUpi <= 0) {
      setError("Device and UPI limits must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...rules,

        fraudRulesEnabled: !!rules.fraudRulesEnabled,
        blockMultipleAccountsSameDevice:
          !!rules.blockMultipleAccountsSameDevice,
        flagSameUpiMultipleUsers: !!rules.flagSameUpiMultipleUsers,
        flagVpnUsers: !!rules.flagVpnUsers,
        flagEmulatorUsers: !!rules.flagEmulatorUsers,
        flagHighCoinsJump: !!rules.flagHighCoinsJump,
        flagReferralAbuse: !!rules.flagReferralAbuse,
        autoBlockHighRisk: !!rules.autoBlockHighRisk,
        withdrawalRiskReviewRequired: !!rules.withdrawalRiskReviewRequired,

        maxAccountsPerDevice,
        maxUsersPerUpi,
        maxDailyCoinsBeforeFlag,
        maxDailyReferralsBeforeFlag,
        maxDailyAdsBeforeFlag,
      });

      setMessage("Fraud rules saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save fraud rules.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading fraud rules..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Fraud Rules</h2>
          <p>Set risk limits for devices, UPI, referrals, ads and coin jumps.</p>
        </div>

        <Button variant="secondary" onClick={loadRules}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        Free Firebase plan cannot run automatic backend checks. Store these rules
        for app-side checks and manual admin review. Strong automation needs
        backend/Cloud Functions later.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <h3 style={{ margin: 0 }}>Fraud Controls</h3>

          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                name="fraudRulesEnabled"
                checked={!!rules.fraudRulesEnabled}
                onChange={handleCheckbox}
              />
              Enable fraud rules
            </label>
          </div>

          <div className="grid grid-2">
            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="blockMultipleAccountsSameDevice"
                  checked={!!rules.blockMultipleAccountsSameDevice}
                  onChange={handleCheckbox}
                />
                Flag same device accounts
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="flagSameUpiMultipleUsers"
                  checked={!!rules.flagSameUpiMultipleUsers}
                  onChange={handleCheckbox}
                />
                Flag same UPI usage
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="flagVpnUsers"
                  checked={!!rules.flagVpnUsers}
                  onChange={handleCheckbox}
                />
                Flag VPN users
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="flagEmulatorUsers"
                  checked={!!rules.flagEmulatorUsers}
                  onChange={handleCheckbox}
                />
                Flag emulator users
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="flagHighCoinsJump"
                  checked={!!rules.flagHighCoinsJump}
                  onChange={handleCheckbox}
                />
                Flag high coin jumps
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="flagReferralAbuse"
                  checked={!!rules.flagReferralAbuse}
                  onChange={handleCheckbox}
                />
                Flag referral abuse
              </label>
            </div>
          </div>

          <h3 style={{ margin: "10px 0 0" }}>Risk Limits</h3>

          <div className="grid grid-2">
            <div className="form-row">
              <label>Max Accounts Per Device</label>
              <input
                type="number"
                name="maxAccountsPerDevice"
                value={rules.maxAccountsPerDevice}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>Max Users Per UPI</label>
              <input
                type="number"
                name="maxUsersPerUpi"
                value={rules.maxUsersPerUpi}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>Daily Coins Before Flag</label>
              <input
                type="number"
                name="maxDailyCoinsBeforeFlag"
                value={rules.maxDailyCoinsBeforeFlag}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>Daily Referrals Before Flag</label>
              <input
                type="number"
                name="maxDailyReferralsBeforeFlag"
                value={rules.maxDailyReferralsBeforeFlag}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>Daily Ads Before Flag</label>
              <input
                type="number"
                name="maxDailyAdsBeforeFlag"
                value={rules.maxDailyAdsBeforeFlag}
                onChange={handleInput}
              />
            </div>
          </div>

          <h3 style={{ margin: "10px 0 0" }}>Review Actions</h3>

          <div className="grid grid-2">
            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="autoBlockHighRisk"
                  checked={!!rules.autoBlockHighRisk}
                  onChange={handleCheckbox}
                />
                Auto block high-risk users
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="withdrawalRiskReviewRequired"
                  checked={!!rules.withdrawalRiskReviewRequired}
                  onChange={handleCheckbox}
                />
                Review risk before withdrawal
              </label>
            </div>
          </div>

          <div className="actions">
            <Button type="submit" disabled={saving} loading={saving}>
              <Save size={18} />
              Save Fraud Rules
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FraudRules;
