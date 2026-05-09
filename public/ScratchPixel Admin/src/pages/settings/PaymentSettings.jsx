import { useEffect, useState } from "react";
import { Save, RefreshCcw, BadgeIndianRupee, AlertTriangle } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function PaymentSettings() {
  const [settings, setSettings] = useState({
    paymentMode: "manual",
    redeemEnabled: true,

    minWithdrawal: 50,
    maxWithdrawalPerDay: 100,
    maxWithdrawalPerWeek: 500,
    coinValue: 100,

    processingTime: "24-72 hours",

    allowUpi: true,
    allowGiftCard: false,
    allowRecharge: false,

    payoutNote: "Withdrawals are reviewed manually before payment.",
    upiWarningText:
      "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",
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
      setError("Unable to load payment settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleInput(e) {
    const { name, value } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCheckbox(e) {
    const { name, checked } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: checked,
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

    const minWithdrawal = toNumber(settings.minWithdrawal, 50);
    const maxWithdrawalPerDay = toNumber(settings.maxWithdrawalPerDay, 0);
    const maxWithdrawalPerWeek = toNumber(settings.maxWithdrawalPerWeek, 0);
    const coinValue = toNumber(settings.coinValue, 100);

    if (coinValue <= 0) {
      setError("Coin value must be greater than 0.");
      return;
    }

    if (minWithdrawal <= 0) {
      setError("Minimum withdrawal must be greater than 0.");
      return;
    }

    if (maxWithdrawalPerDay < 0 || maxWithdrawalPerWeek < 0) {
      setError("Withdrawal limits cannot be negative. Use 0 for no strict limit.");
      return;
    }

    if (
      maxWithdrawalPerDay > 0 &&
      maxWithdrawalPerWeek > 0 &&
      maxWithdrawalPerWeek < maxWithdrawalPerDay
    ) {
      setError("Weekly withdrawal limit cannot be lower than daily withdrawal limit.");
      return;
    }

    if (!settings.allowUpi && !settings.allowGiftCard && !settings.allowRecharge) {
      setError("At least one redeem method should be enabled.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        redeemEnabled: !!settings.redeemEnabled,
        allowUpi: !!settings.allowUpi,
        allowGiftCard: !!settings.allowGiftCard,
        allowRecharge: !!settings.allowRecharge,

        minWithdrawal,
        maxWithdrawalPerDay,
        maxWithdrawalPerWeek,
        coinValue,

        paymentMode: settings.paymentMode || "manual",
        processingTime: settings.processingTime || "24-72 hours",

        payoutNote:
          settings.payoutNote ||
          "Withdrawals are reviewed manually before payment.",

        upiWarningText:
          settings.upiWarningText ||
          "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",
      });

      setMessage("Payment settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save payment settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading payment settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Payment Settings</h2>
          <p>Control withdrawal rules, coin value and payout methods.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <BadgeIndianRupee size={18} />
        Manual UPI payout with admin approval is safest for the first release.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <BadgeIndianRupee size={18} />
              <h3>Withdrawal Control</h3>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="redeemEnabled"
                  checked={!!settings.redeemEnabled}
                  onChange={handleCheckbox}
                />
                Enable withdrawal/redeem system
              </label>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={settings.paymentMode}
                  onChange={handleInput}
                >
                  <option value="manual">Manual UPI</option>
                  <option value="razorpayx-disabled">RazorpayX Later</option>
                  <option value="cashfree-disabled">Cashfree Later</option>
                </select>
                <small>Automatic payout can be connected later.</small>
              </div>

              <div className="form-row">
                <label>Processing Time</label>
                <input
                  name="processingTime"
                  value={settings.processingTime}
                  onChange={handleInput}
                  placeholder="24-72 hours"
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <BadgeIndianRupee size={18} />
              <h3>Coin & Withdrawal Limits</h3>
            </div>

            <div className="grid grid-2">
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
                <label>Max Withdrawal Per Day ₹</label>
                <input
                  type="number"
                  name="maxWithdrawalPerDay"
                  value={settings.maxWithdrawalPerDay}
                  onChange={handleInput}
                />
                <small>Use 0 for no strict limit.</small>
              </div>

              <div className="form-row">
                <label>Max Withdrawal Per Week ₹</label>
                <input
                  type="number"
                  name="maxWithdrawalPerWeek"
                  value={settings.maxWithdrawalPerWeek}
                  onChange={handleInput}
                />
                <small>Use 0 for no strict limit.</small>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <BadgeIndianRupee size={18} />
              <h3>Allowed Redeem Methods</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowUpi"
                    checked={!!settings.allowUpi}
                    onChange={handleCheckbox}
                  />
                  Allow UPI
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowGiftCard"
                    checked={!!settings.allowGiftCard}
                    onChange={handleCheckbox}
                  />
                  Allow Gift Card
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowRecharge"
                    checked={!!settings.allowRecharge}
                    onChange={handleCheckbox}
                  />
                  Allow Mobile Recharge
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <AlertTriangle size={18} />
              <h3>User Warning Texts</h3>
            </div>

            <div className="form-row">
              <label>Payout Note</label>
              <textarea
                name="payoutNote"
                value={settings.payoutNote}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>UPI Responsibility Warning</label>
              <textarea
                name="upiWarningText"
                value={settings.upiWarningText}
                onChange={handleInput}
              />
              <small>This text can be shown on the app withdrawal screen.</small>
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Payment Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default PaymentSettings;