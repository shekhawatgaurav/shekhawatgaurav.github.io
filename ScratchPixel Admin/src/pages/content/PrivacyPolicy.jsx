import { useEffect, useState } from "react";
import { Save, RefreshCcw, ShieldCheck } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

const defaultPrivacyPolicy = `Privacy Policy

We collect basic account information such as name, email, mobile number, device information, reward activity, KYC details and withdrawal details to provide rewards and prevent fraud.

We use this data to manage user accounts, track coins, process withdrawal requests, improve app performance and protect the platform from fake accounts, bots, emulator abuse or referral abuse.

We do not sell user data. Some third-party services such as ads, analytics or payment providers may process limited information according to their own policies.

Users can request account deletion from inside the app. Account deletion requests may be reviewed by admin before final action.

By using this app, users agree to this privacy policy.`;

function PrivacyPolicy() {
  const [privacyPolicy, setPrivacyPolicy] = useState(defaultPrivacyPolicy);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPolicy() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAppSettings();

      setPrivacyPolicy(data.privacyPolicy || defaultPrivacyPolicy);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load privacy policy.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPolicy();
  }, []);

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanPolicy = privacyPolicy.trim();

    if (!cleanPolicy) {
      setError("Privacy policy text is required.");
      return;
    }

    if (cleanPolicy.length < 100) {
      setError("Privacy policy text is too short. Please add proper details.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        privacyPolicy: cleanPolicy,
      });

      setPrivacyPolicy(cleanPolicy);
      setMessage("Privacy policy saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save privacy policy.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading privacy policy..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Privacy Policy</h2>
          <p>Edit privacy policy text shown inside your user app.</p>
        </div>

        <Button variant="secondary" onClick={loadPolicy}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldCheck size={18} />
        Before launch, review this with a legal expert because your app handles
        rewards, KYC, ads and withdrawals.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-row">
            <label>Privacy Policy Text</label>
            <textarea
              style={{ minHeight: 420 }}
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
            />
            <small>
              Mention data collection, ads/analytics, KYC, withdrawals, fraud
              prevention and account deletion.
            </small>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Privacy Policy
          </Button>
        </form>
      </div>
    </div>
  );
}

export default PrivacyPolicy;