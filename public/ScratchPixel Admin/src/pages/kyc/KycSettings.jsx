import { useEffect, useState } from "react";
import { Save, RefreshCcw, BadgeCheck, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function KycSettings() {
  const [settings, setSettings] = useState({
    kycRequired: true,
    kycBeforeWithdrawal: true,

    allowPanKyc: true,
    allowAadhaarKyc: false,
    requireSelfie: false,

    minWithdrawalWithoutKyc: 0,
    maxKycAttempts: 3,

    kycReviewTime: "24-72 hours",
    kycInstructions:
      "Submit document details carefully. Your details are locked during review and after verification.",

    allowKycResubmitAfterApproval: false,
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
      setError("Unable to load KYC settings.");
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

    const minWithdrawalWithoutKyc = toNumber(
      settings.minWithdrawalWithoutKyc,
      0
    );

    const maxKycAttempts = toNumber(settings.maxKycAttempts, 3);

    const kycReviewTime = String(settings.kycReviewTime || "").trim();

    const kycInstructions = String(settings.kycInstructions || "").trim();

    if (!settings.allowPanKyc && !settings.allowAadhaarKyc) {
      setError("At least one KYC document type must be enabled.");
      return;
    }

    if (minWithdrawalWithoutKyc < 0) {
      setError("Min withdrawal without KYC cannot be negative.");
      return;
    }

    if (maxKycAttempts <= 0) {
      setError("Max KYC attempts must be at least 1.");
      return;
    }

    if (!kycReviewTime) {
      setError("KYC review time is required.");
      return;
    }

    if (!kycInstructions) {
      setError("KYC instructions are required.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        kycRequired: !!settings.kycRequired,
        kycBeforeWithdrawal: !!settings.kycBeforeWithdrawal,

        allowPanKyc: !!settings.allowPanKyc,
        allowAadhaarKyc: !!settings.allowAadhaarKyc,
        requireSelfie: !!settings.requireSelfie,

        allowKycResubmitAfterApproval:
          !!settings.allowKycResubmitAfterApproval,

        minWithdrawalWithoutKyc,
        maxKycAttempts,

        kycReviewTime:
          kycReviewTime || "24-72 hours",

        kycInstructions:
          kycInstructions ||
          "Submit document details carefully. Your details are locked during review and after verification.",
      });

      setMessage("KYC settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save KYC settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading KYC settings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>KYC Settings</h2>
          <p>Control KYC requirements before user withdrawals.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        KYC data is sensitive. Keep access limited and avoid collecting more
        documents than necessary.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <BadgeCheck size={18} />
              <h3>KYC Requirement</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="kycRequired"
                    checked={!!settings.kycRequired}
                    onChange={handleCheckbox}
                  />
                  Enable KYC system
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="kycBeforeWithdrawal"
                    checked={!!settings.kycBeforeWithdrawal}
                    onChange={handleCheckbox}
                  />
                  Require KYC before withdrawal
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="requireSelfie"
                    checked={!!settings.requireSelfie}
                    onChange={handleCheckbox}
                  />
                  Require selfie upload
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowKycResubmitAfterApproval"
                    checked={!!settings.allowKycResubmitAfterApproval}
                    onChange={handleCheckbox}
                  />
                  Allow re-submit after approval
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <BadgeCheck size={18} />
              <h3>Allowed Documents</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowPanKyc"
                    checked={!!settings.allowPanKyc}
                    onChange={handleCheckbox}
                  />
                  Allow PAN card
                </label>
              </div>

              <div className="form-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="allowAadhaarKyc"
                    checked={!!settings.allowAadhaarKyc}
                    onChange={handleCheckbox}
                  />
                  Allow Aadhaar card
                </label>
              </div>
            </div>

            {settings.allowAadhaarKyc && (
              <div className="warning-box" style={{ marginTop: 14 }}>
                Aadhaar is highly sensitive. Enable it only if your app policy,
                storage rules, and privacy flow are ready.
              </div>
            )}
          </div>

          <div className="settings-section">
            <div className="section-title">
              <BadgeCheck size={18} />
              <h3>Limits & Review</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Min Withdrawal Without KYC ₹</label>
                <input
                  type="number"
                  name="minWithdrawalWithoutKyc"
                  value={settings.minWithdrawalWithoutKyc}
                  onChange={handleInput}
                />
                <small>Use 0 if KYC is always required before withdrawal.</small>
              </div>

              <div className="form-row">
                <label>Max KYC Attempts</label>
                <input
                  type="number"
                  name="maxKycAttempts"
                  value={settings.maxKycAttempts}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>KYC Review Time</label>
                <input
                  name="kycReviewTime"
                  value={settings.kycReviewTime}
                  onChange={handleInput}
                  placeholder="24-72 hours"
                />
              </div>
            </div>

            <div className="form-row">
              <label>KYC Instructions</label>
              <textarea
                name="kycInstructions"
                value={settings.kycInstructions}
                onChange={handleInput}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save KYC Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default KycSettings;