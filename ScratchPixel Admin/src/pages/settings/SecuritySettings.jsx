import { useEffect, useState } from "react";
import { Save, RefreshCcw, ShieldCheck, UserX, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function SecuritySettings() {
  const [settings, setSettings] = useState({
    oneDeviceOneAccount: true,
    blockVpn: false,
    blockEmulator: true,

    requireEmailVerified: false,
    requirePhoneVerified: false,

    kycBeforeWithdrawal: true,
    withdrawalRiskReviewRequired: true,

    adminLoginAudit: true,
    autoLogoutMinutes: 60,
    maxLoginAttempts: 5,
    suspiciousLoginAlert: true,

    fraudRulesEnabled: true,
    blockMultipleAccountsSameDevice: true,
    flagSameUpiMultipleUsers: true,
    flagHighCoinsJump: true,
    autoBlockHighRisk: false,

    deleteAccountEnabled: true,
    deleteAccountRequiresAdminApproval: true,
    accountDeletePolicyText:
      "Account deletion requests are reviewed by admin before final action.",
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
      setError("Unable to load security settings.");
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

    const autoLogoutMinutes = toNumber(settings.autoLogoutMinutes, 60);
    const maxLoginAttempts = toNumber(settings.maxLoginAttempts, 5);

    if (autoLogoutMinutes < 5) {
      setError("Auto logout must be at least 5 minutes.");
      return;
    }

    if (maxLoginAttempts < 1) {
      setError("Max login attempts must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        oneDeviceOneAccount: !!settings.oneDeviceOneAccount,
        blockVpn: !!settings.blockVpn,
        blockEmulator: !!settings.blockEmulator,

        requireEmailVerified: !!settings.requireEmailVerified,
        requirePhoneVerified: !!settings.requirePhoneVerified,

        kycBeforeWithdrawal: !!settings.kycBeforeWithdrawal,
        withdrawalRiskReviewRequired: !!settings.withdrawalRiskReviewRequired,

        adminLoginAudit: !!settings.adminLoginAudit,
        suspiciousLoginAlert: !!settings.suspiciousLoginAlert,

        fraudRulesEnabled: !!settings.fraudRulesEnabled,
        blockMultipleAccountsSameDevice:
          !!settings.blockMultipleAccountsSameDevice,
        flagSameUpiMultipleUsers: !!settings.flagSameUpiMultipleUsers,
        flagHighCoinsJump: !!settings.flagHighCoinsJump,
        autoBlockHighRisk: !!settings.autoBlockHighRisk,

        deleteAccountEnabled: !!settings.deleteAccountEnabled,
        deleteAccountRequiresAdminApproval:
          !!settings.deleteAccountRequiresAdminApproval,

        autoLogoutMinutes,
        maxLoginAttempts,

        accountDeletePolicyText:
          settings.accountDeletePolicyText ||
          "Account deletion requests are reviewed by admin before final action.",
      });

      setMessage("Security settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save security settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading security settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Security Settings</h2>
          <p>Control device, login, account and fraud-related security rules.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldCheck size={18} />
        VPN, emulator, one-device account and phone/email verification also need
        app-side checks to enforce properly.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <ShieldCheck size={18} />
              <h3>User Account Security</h3>
            </div>

            <div className="grid grid-2">
              {[
                ["oneDeviceOneAccount", "One device one account"],
                ["blockVpn", "Block VPN users"],
                ["blockEmulator", "Block emulator users"],
                ["requireEmailVerified", "Require email verification"],
                ["requirePhoneVerified", "Require phone verification"],
                ["kycBeforeWithdrawal", "Require KYC before withdrawal"],
                ["withdrawalRiskReviewRequired", "Risk review before withdrawal"],
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
              <ShieldCheck size={18} />
              <h3>Admin Security</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="adminLoginAudit"
                    checked={!!settings.adminLoginAudit}
                    onChange={handleCheckbox}
                  />
                  Track admin login audit
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="suspiciousLoginAlert"
                    checked={!!settings.suspiciousLoginAlert}
                    onChange={handleCheckbox}
                  />
                  Suspicious login alert
                </label>
              </div>

              <div className="form-row">
                <label>Auto Logout Minutes</label>
                <input
                  type="number"
                  name="autoLogoutMinutes"
                  value={settings.autoLogoutMinutes}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <ShieldAlert size={18} />
              <h3>Fraud Protection</h3>
            </div>

            <div className="grid grid-2">
              {[
                ["fraudRulesEnabled", "Enable fraud rules"],
                ["blockMultipleAccountsSameDevice", "Block multiple accounts on same device"],
                ["flagSameUpiMultipleUsers", "Flag same UPI on multiple users"],
                ["flagHighCoinsJump", "Flag sudden high coin jumps"],
                ["autoBlockHighRisk", "Auto block high-risk users"],
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
              <UserX size={18} />
              <h3>Account Deletion</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="deleteAccountEnabled"
                    checked={!!settings.deleteAccountEnabled}
                    onChange={handleCheckbox}
                  />
                  Allow delete account requests
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="deleteAccountRequiresAdminApproval"
                    checked={!!settings.deleteAccountRequiresAdminApproval}
                    onChange={handleCheckbox}
                  />
                  Require admin approval
                </label>
              </div>
            </div>

            <div className="form-row">
              <label>Delete Account Policy Text</label>
              <textarea
                name="accountDeletePolicyText"
                value={settings.accountDeletePolicyText}
                onChange={handleInput}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Security Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SecuritySettings;