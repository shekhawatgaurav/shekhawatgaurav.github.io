import { useEffect, useState } from "react";
import { Save, RefreshCcw, FileText, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

const defaultTerms = `Terms & Conditions

Welcome to Scratch Pixel.

By using this app, you agree to follow these Terms & Conditions.

1. Rewards and Coins
Coins are virtual reward points inside the app. Coins do not represent real money until a valid withdrawal request is approved by admin. Reward values, coin value and withdrawal rules may change anytime.

2. Fair Usage
Users must not create fake accounts, use bots, emulators, VPN abuse, automation tools, repeated device abuse, referral abuse or any method that unfairly increases coins or rewards.

3. Ads and Tasks
Rewards from ads or tasks are given only after successful completion as per app rules. Failed ads, incomplete actions or suspicious activity may not be rewarded.

4. Withdrawals
Withdrawal requests are reviewed manually. Admin may approve, reject, delay or cancel requests if fraud, wrong UPI ID, invalid details, suspicious activity or policy violation is found.

5. KYC
KYC may be required before withdrawal. Users must submit correct and valid details. Incorrect or unclear documents may be rejected.

6. Account Blocking
We may block, suspend or restrict accounts involved in fraud, abuse, fake referrals, suspicious earning patterns or violation of these terms.

7. No Guaranteed Earnings
This app does not guarantee fixed income, fixed daily earnings or assured cash. Rewards depend on app rules, availability, verification and admin review.

8. Account Deletion
Users may request account deletion from inside the app. Some requests may be reviewed before final deletion for security, fraud prevention or pending withdrawal checks.

9. Changes to Terms
We may update these Terms & Conditions anytime. Continued use of the app means you accept the updated terms.

By using this app, you agree to these Terms & Conditions.`;

function Terms() {
  const [terms, setTerms] = useState(defaultTerms);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTerms() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAppSettings();
      setTerms(data.termsAndConditions || data.terms || defaultTerms);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load terms and conditions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTerms();
  }, []);

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanTerms = terms.trim();

    if (!cleanTerms) {
      setError("Terms & Conditions text is required.");
      return;
    }

    if (cleanTerms.length < 100) {
      setError("Terms & Conditions text is too short. Please add proper details.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        termsAndConditions: cleanTerms,

        // legacy compatibility
        terms: cleanTerms,
      });

      setTerms(cleanTerms);
      setMessage("Terms & Conditions saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save terms and conditions.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading terms and conditions..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Terms & Conditions</h2>
          <p>Edit terms shown inside your user app.</p>
        </div>

        <Button variant="secondary" onClick={loadTerms}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        Review these terms before launch. Avoid guaranteed earning claims and
        clearly mention fraud, KYC, ads and withdrawal rules.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <FileText size={18} />
              <h3>Terms Text</h3>
            </div>

            <div className="form-row">
              <label>Terms & Conditions Text</label>
              <textarea
                style={{ minHeight: 460 }}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
              <small>
                Include reward rules, withdrawals, KYC, fraud policy, account
                blocking and no guaranteed earnings.
              </small>
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Terms
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Terms;