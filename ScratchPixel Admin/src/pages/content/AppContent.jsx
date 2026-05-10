import { useEffect, useState } from "react";
import { Save, RefreshCcw, FileText, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function AppContent() {
  const [content, setContent] = useState({
    appName: "Scratch Pixel",
    tagline: "Scratch daily and earn rewards",
    welcomeTitle: "Welcome to Scratch Pixel",
    welcomeMessage: "Complete tasks, scratch cards and redeem your coins.",

    scratchCardTitle: "Daily Scratch",
    scratchCardSubtitle: "Scratch once daily and win coins.",

    redeemInfo:
      "Minimum withdrawal amount applies. All requests are reviewed by admin.",
    supportEmail: "",

    faqText: "",
    disclaimerText:
      "This app is a rewards platform. It is not gambling, betting, lottery or casino.",

    upiWarningText:
      "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you.",

    kycInstructions:
      "Submit your KYC details carefully. Details cannot be changed after approval.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadContent() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAppSettings();

      setContent((current) => ({
        ...current,
        ...data,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load app content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setContent((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function isValidEmail(email = "") {
    if (!email.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function cleanText(value, fallback = "") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!content.appName.trim()) {
      setError("App name is required.");
      return;
    }

    if (!content.welcomeTitle.trim()) {
      setError("Welcome title is required.");
      return;
    }

    if (!content.welcomeMessage.trim()) {
      setError("Welcome message is required.");
      return;
    }

    if (!isValidEmail(content.supportEmail)) {
      setError("Please enter a valid support email.");
      return;
    }

    if (!content.disclaimerText.trim()) {
      setError("Disclaimer text is required.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...content,

        appName: cleanText(content.appName, "Scratch Pixel"),
        tagline: cleanText(content.tagline, "Scratch daily and earn rewards"),

        welcomeTitle: cleanText(
          content.welcomeTitle,
          "Welcome to Scratch Pixel"
        ),

        welcomeMessage: cleanText(
          content.welcomeMessage,
          "Complete tasks, scratch cards and redeem your coins."
        ),

        scratchCardTitle: cleanText(content.scratchCardTitle, "Daily Scratch"),

        scratchCardSubtitle: cleanText(
          content.scratchCardSubtitle,
          "Scratch once daily and win coins."
        ),

        redeemInfo: cleanText(
          content.redeemInfo,
          "Minimum withdrawal amount applies. All requests are reviewed by admin."
        ),

        supportEmail: String(content.supportEmail || "").trim().toLowerCase(),

        faqText: String(content.faqText || "").trim(),

        disclaimerText: cleanText(
          content.disclaimerText,
          "This app is a rewards platform. It is not gambling, betting, lottery or casino."
        ),

        upiWarningText: cleanText(
          content.upiWarningText,
          "Enter your correct UPI ID. We are not responsible if payment is sent to a wrong UPI ID provided by you."
        ),

        kycInstructions: cleanText(
          content.kycInstructions,
          "Submit your KYC details carefully. Details cannot be changed after approval."
        ),
      });

      setMessage("App content updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save app content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading app content..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>App Content</h2>
          <p>Manage text shown inside the user app.</p>
        </div>

        <Button variant="secondary" onClick={loadContent}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        Keep user-facing text simple and legally safe. Avoid guaranteed earning
        claims like “earn fixed money daily”.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <FileText size={18} />
              <h3>General App Text</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>App Name</label>
                <input
                  name="appName"
                  value={content.appName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Support Email</label>
                <input
                  name="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  value={content.supportEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <label>Tagline</label>
              <input
                name="tagline"
                value={content.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Welcome Title</label>
              <input
                name="welcomeTitle"
                value={content.welcomeTitle}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Welcome Message</label>
              <textarea
                name="welcomeMessage"
                value={content.welcomeMessage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <FileText size={18} />
              <h3>Reward & Withdrawal Text</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Scratch Card Title</label>
                <input
                  name="scratchCardTitle"
                  value={content.scratchCardTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Scratch Card Subtitle</label>
                <input
                  name="scratchCardSubtitle"
                  value={content.scratchCardSubtitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <label>Redeem Info Text</label>
              <textarea
                name="redeemInfo"
                value={content.redeemInfo}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>UPI Warning Text</label>
              <textarea
                name="upiWarningText"
                value={content.upiWarningText}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>KYC Instructions</label>
              <textarea
                name="kycInstructions"
                value={content.kycInstructions}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <FileText size={18} />
              <h3>Help & Disclaimer</h3>
            </div>

            <div className="form-row">
              <label>FAQ Text</label>
              <textarea
                name="faqText"
                placeholder="Write common questions and answers..."
                value={content.faqText}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Disclaimer Text</label>
              <textarea
                name="disclaimerText"
                value={content.disclaimerText}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Content
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AppContent;