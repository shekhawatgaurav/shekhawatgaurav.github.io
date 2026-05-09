import { useEffect, useState } from "react";
import { Save, RefreshCcw, Smartphone, Wrench } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getAppSettings, updateAppSettings } from "../../services/settingsService";

function VersionControl() {
  const [settings, setSettings] = useState({
    currentAppVersion: "1.0.0",
    minimumAppVersion: "1.0.0",
    forceUpdate: false,

    maintenanceMode: false,

    updateTitle: "New update available",
    updateMessage: "Please update the app to continue using rewards.",
    playStoreUrl: "",

    appMaintenanceMessage: "App is under maintenance. Please try again later.",
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
      setError("Unable to load version control.");
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

  function isValidVersion(value) {
    return /^\d+\.\d+\.\d+$/.test(String(value || "").trim());
  }

  function isValidUrl(value) {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const currentAppVersion = settings.currentAppVersion.trim();
    const minimumAppVersion = settings.minimumAppVersion.trim();
    const playStoreUrl = settings.playStoreUrl.trim();

    if (!currentAppVersion) {
      setError("Current app version is required.");
      return;
    }

    if (!minimumAppVersion) {
      setError("Minimum app version is required.");
      return;
    }

    if (!isValidVersion(currentAppVersion)) {
      setError("Current app version must be in format like 1.0.0.");
      return;
    }

    if (!isValidVersion(minimumAppVersion)) {
      setError("Minimum app version must be in format like 1.0.0.");
      return;
    }

    if (playStoreUrl && !isValidUrl(playStoreUrl)) {
      setError("Please enter a valid Play Store URL.");
      return;
    }

    if (settings.forceUpdate && !playStoreUrl) {
      setError("Play Store URL is required when force update is enabled.");
      return;
    }

    try {
      setSaving(true);

      await updateAppSettings({
        ...settings,

        forceUpdate: !!settings.forceUpdate,
        maintenanceMode: !!settings.maintenanceMode,

        currentAppVersion,
        minimumAppVersion,

        updateTitle: settings.updateTitle || "New update available",
        updateMessage:
          settings.updateMessage ||
          "Please update the app to continue using rewards.",

        appMaintenanceMessage:
          settings.appMaintenanceMessage ||
          "App is under maintenance. Please try again later.",

        playStoreUrl,
      });

      setMessage("Version control settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save version control.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading version control..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Version Control</h2>
          <p>Manage force update, minimum app version and maintenance mode.</p>
        </div>

        <Button variant="secondary" onClick={loadSettings}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <Smartphone size={18} />
        The Flutter app must read these settings from Firestore on startup.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Smartphone size={18} />
              <h3>App Version Rules</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Current App Version</label>
                <input
                  name="currentAppVersion"
                  value={settings.currentAppVersion}
                  onChange={handleInput}
                  placeholder="1.0.0"
                />
                <small>Latest version available for users.</small>
              </div>

              <div className="form-row">
                <label>Minimum App Version</label>
                <input
                  name="minimumAppVersion"
                  value={settings.minimumAppVersion}
                  onChange={handleInput}
                  placeholder="1.0.0"
                />
                <small>Users below this version can be forced to update.</small>
              </div>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="forceUpdate"
                  checked={!!settings.forceUpdate}
                  onChange={handleCheckbox}
                />
                Enable force update
              </label>
            </div>

            <div className="form-row">
              <label>Play Store URL</label>
              <input
                name="playStoreUrl"
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={settings.playStoreUrl}
                onChange={handleInput}
              />
              <small>Required when force update is enabled.</small>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Smartphone size={18} />
              <h3>Update Screen Text</h3>
            </div>

            <div className="form-row">
              <label>Update Title</label>
              <input
                name="updateTitle"
                value={settings.updateTitle}
                onChange={handleInput}
              />
            </div>

            <div className="form-row">
              <label>Update Message</label>
              <textarea
                name="updateMessage"
                value={settings.updateMessage}
                onChange={handleInput}
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Wrench size={18} />
              <h3>Maintenance Mode</h3>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={!!settings.maintenanceMode}
                  onChange={handleCheckbox}
                />
                Enable maintenance mode
              </label>
            </div>

            <div className="form-row">
              <label>Maintenance Message</label>
              <textarea
                name="appMaintenanceMessage"
                value={settings.appMaintenanceMessage}
                onChange={handleInput}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Version Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default VersionControl;