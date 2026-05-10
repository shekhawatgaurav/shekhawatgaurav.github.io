import { useEffect, useState } from "react";
import { Save, RefreshCcw, Wallet, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function WalletSettings() {
  const [settings, setSettings] = useState({
    walletEnabled: true,
    redeemEnabled: true,

    coinValue: 100,
    minWithdrawal: 50,
    maxWalletCoins: 100000,

    coinExpiryEnabled: false,
    coinExpiryDays: 365,

    allowManualAdjustment: true,
    showRupeeEquivalent: true,
    allowNegativeWallet: false,

    processingTime: "24-72 hours",
    walletNote:
      "Coins are virtual reward points. Redemption is subject to review and app rules.",
    payoutNote:
      "Withdrawals are reviewed manually before payment.",
    upiWarningText:
      "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function cleanText(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  async function loadSettings() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAppSettings();

      setSettings((current) => ({
        ...current,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load wallet settings.");
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

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const coinValue = toNumber(settings.coinValue, 100);
    const minWithdrawal = toNumber(settings.minWithdrawal, 50);
    const maxWalletCoins = toNumber(settings.maxWalletCoins, 100000);
    const coinExpiryDays = toNumber(settings.coinExpiryDays, 365);

    if (coinValue <= 0) {
      setError("Coin value must be greater than 0.");
      return;
    }

    if (minWithdrawal <= 0) {
      setError("Minimum withdrawal must be greater than 0.");
      return;
    }

    if (maxWalletCoins < 0) {
      setError("Max wallet coins cannot be negative.");
      return;
    }

    if (maxWalletCoins > 0 && maxWalletCoins < coinValue) {
      setError("Max wallet coins should be at least equal to coin value.");
      return;
    }

    if (settings.coinExpiryEnabled && coinExpiryDays <= 0) {
      setError("Coin expiry days must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        walletEnabled: !!settings.walletEnabled,
        redeemEnabled: !!settings.redeemEnabled,
        coinExpiryEnabled: !!settings.coinExpiryEnabled,
        allowManualAdjustment: !!settings.allowManualAdjustment,
        showRupeeEquivalent: !!settings.showRupeeEquivalent,
        allowNegativeWallet: !!settings.allowNegativeWallet,

        coinValue,
        minWithdrawal,
        maxWalletCoins,
        coinExpiryDays,

        processingTime: cleanText(settings.processingTime, "24-72 hours"),

        walletNote: cleanText(
          settings.walletNote,
          "Coins are virtual reward points. Redemption is subject to review and app rules."
        ),

        payoutNote: cleanText(
          settings.payoutNote,
          "Withdrawals are reviewed manually before payment."
        ),

        upiWarningText: cleanText(
          settings.upiWarningText,
          "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you."
        ),

        maxDailyEarning: null,
      });

      setMessage("Wallet settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save wallet settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading wallet settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Wallet Settings</h2>
          <p>
            Control coin value, wallet limits, withdrawal threshold and payout
            notes.
          </p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        Wallet rewards should stay balanced with ad revenue. Avoid showing
        confusing daily earning caps in the app.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Coin Value"
          value={`${settings.coinValue} coins = ₹1`}
          icon={Wallet}
        />

        <StatCard
          title="Min Withdrawal"
          value={`₹${settings.minWithdrawal}`}
          icon={Wallet}
        />

        <StatCard
          title="Max Wallet Coins"
          value={settings.maxWalletCoins || 0}
          icon={Wallet}
        />

        <StatCard
          title="Wallet Status"
          value={settings.walletEnabled ? "ON" : "OFF"}
          icon={Wallet}
          variant={settings.walletEnabled ? "success" : "danger"}
        />
      </div>

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Wallet size={18} />
              <h3>Wallet Controls</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="walletEnabled"
                    checked={!!settings.walletEnabled}
                    onChange={handleCheckbox}
                  />
                  Enable wallet system
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="redeemEnabled"
                    checked={!!settings.redeemEnabled}
                    onChange={handleCheckbox}
                  />
                  Enable withdrawals / redeem
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="showRupeeEquivalent"
                    checked={!!settings.showRupeeEquivalent}
                    onChange={handleCheckbox}
                  />
                  Show rupee equivalent in app
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowManualAdjustment"
                    checked={!!settings.allowManualAdjustment}
                    onChange={handleCheckbox}
                  />
                  Allow manual admin coin adjustment
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowNegativeWallet"
                    checked={!!settings.allowNegativeWallet}
                    onChange={handleCheckbox}
                  />
                  Allow negative wallet
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="coinExpiryEnabled"
                    checked={!!settings.coinExpiryEnabled}
                    onChange={handleCheckbox}
                  />
                  Enable coin expiry
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Wallet size={18} />
              <h3>Coin & Withdrawal Rules</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Coin Value</label>
                <input
                  type="number"
                  min="1"
                  name="coinValue"
                  value={settings.coinValue}
                  onChange={handleInput}
                />
                <small>Example: 100 means 100 coins = ₹1</small>
              </div>

              <div className="form-row">
                <label>Minimum Withdrawal Amount ₹</label>
                <input
                  type="number"
                  min="1"
                  name="minWithdrawal"
                  value={settings.minWithdrawal}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Max Wallet Coins</label>
                <input
                  type="number"
                  min="0"
                  name="maxWalletCoins"
                  value={settings.maxWalletCoins}
                  onChange={handleInput}
                />
                <small>Use 0 if you do not want strict max wallet limit.</small>
              </div>

              <div className="form-row">
                <label>Coin Expiry Days</label>
                <input
                  type="number"
                  min="1"
                  name="coinExpiryDays"
                  value={settings.coinExpiryDays}
                  onChange={handleInput}
                  disabled={!settings.coinExpiryEnabled}
                />
              </div>

              <div className="form-row">
                <label>Withdrawal Processing Time</label>
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
              <ShieldAlert size={18} />
              <h3>User Texts</h3>
            </div>

            <div className="form-row">
              <label>Wallet Note</label>
              <textarea
                name="walletNote"
                value={settings.walletNote}
                onChange={handleInput}
              />
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
              <small>This warning should appear near UPI input in app.</small>
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Wallet Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default WalletSettings;