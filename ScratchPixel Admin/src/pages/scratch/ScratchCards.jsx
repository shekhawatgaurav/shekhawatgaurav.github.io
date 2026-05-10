import { useEffect, useState } from "react";
import { Gift, RefreshCcw, Save, ShieldAlert } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import { getScratchRules, updateScratchRules } from "../../services/scratchService";

function ScratchCards() {
  const [rules, setRules] = useState({
    scratchEnabled: true,
    freeScratchPerDay: 1,
    scratchMinCoins: 1,
    scratchMaxCoins: 20,
    scratchResetText: "Resets daily at midnight",
    scratchRewardTitle: "You won!",
    scratchRewardSubtitle: "Coins have been added to your wallet.",
    scratchNote:
      "Scratch daily to earn random coins. Rewards may change anytime.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRules() {
    try {
      setLoading(true);
      setError("");

      const data = await getScratchRules();

      setRules((current) => ({
        ...current,
        ...data,

        scratchEnabled: data.scratchEnabled ?? data.enabled ?? true,
        freeScratchPerDay: data.freeScratchPerDay ?? 1,

        scratchMinCoins: data.scratchMinCoins ?? data.minCoins ?? 1,
        scratchMaxCoins: data.scratchMaxCoins ?? data.maxCoins ?? 20,

        scratchResetText:
          data.scratchResetText || current.scratchResetText,

        scratchRewardTitle:
          data.scratchRewardTitle || current.scratchRewardTitle,

        scratchRewardSubtitle:
          data.scratchRewardSubtitle || current.scratchRewardSubtitle,

        scratchNote:
          data.scratchNote || current.scratchNote,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load scratch rules.");
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

  function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const freeScratchPerDay = toNumber(rules.freeScratchPerDay, 1);
    const scratchMinCoins = toNumber(rules.scratchMinCoins, 1);
    const scratchMaxCoins = toNumber(rules.scratchMaxCoins, 20);

    if (freeScratchPerDay <= 0) {
      setError("Free scratch per day must be at least 1.");
      return;
    }

    if (scratchMinCoins < 0 || scratchMaxCoins < 0) {
      setError("Scratch coins cannot be negative.");
      return;
    }

    if (scratchMinCoins > scratchMaxCoins) {
      setError("Minimum coins cannot be greater than maximum coins.");
      return;
    }

    if (!rules.scratchRewardTitle.trim()) {
      setError("Reward title is required.");
      return;
    }

    try {
      setSaving(true);

      await updateScratchRules({
        scratchEnabled: !!rules.scratchEnabled,
        freeScratchPerDay,
        scratchMinCoins,
        scratchMaxCoins,

        scratchResetText:
          rules.scratchResetText?.trim() || "Resets daily at midnight",

        scratchRewardTitle:
          rules.scratchRewardTitle?.trim() || "You won!",

        scratchRewardSubtitle:
          rules.scratchRewardSubtitle?.trim() ||
          "Coins have been added to your wallet.",

        scratchNote:
          rules.scratchNote?.trim() ||
          "Scratch daily to earn random coins. Rewards may change anytime.",

        // legacy compatibility
        enabled: !!rules.scratchEnabled,
        minCoins: scratchMinCoins,
        maxCoins: scratchMaxCoins,
      });

      setMessage("Scratch card rules saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save scratch card rules.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading scratch cards..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Scratch Cards</h2>
          <p>Control daily scratch availability, reward text and coin range.</p>
        </div>

        <Button variant="secondary" onClick={loadRules}>
          <RefreshCcw size={18} />
          Reload
        </Button>
      </div>

      <div className="warning-box">
        <ShieldAlert size={18} />
        App should give reward only once per valid scratch. Keep max coins safe
        according to ad revenue.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Scratch Status"
          value={rules.scratchEnabled ? "ON" : "OFF"}
          icon={Gift}
          variant={rules.scratchEnabled ? "success" : "danger"}
        />

        <StatCard
          title="Free Scratch / Day"
          value={rules.freeScratchPerDay}
          icon={Gift}
        />

        <StatCard
          title="Min Coins"
          value={rules.scratchMinCoins}
          icon={Gift}
        />

        <StatCard
          title="Max Coins"
          value={rules.scratchMaxCoins}
          icon={Gift}
        />
      </div>

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSave}>
          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>Scratch Control</h3>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="scratchEnabled"
                  checked={!!rules.scratchEnabled}
                  onChange={handleCheckbox}
                />
                Enable daily scratch card
              </label>
            </div>

            <div className="grid grid-3">
              <div className="form-row">
                <label>Free Scratch Per Day</label>
                <input
                  type="number"
                  name="freeScratchPerDay"
                  value={rules.freeScratchPerDay}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Minimum Coins</label>
                <input
                  type="number"
                  name="scratchMinCoins"
                  value={rules.scratchMinCoins}
                  onChange={handleInput}
                />
              </div>

              <div className="form-row">
                <label>Maximum Coins</label>
                <input
                  type="number"
                  name="scratchMaxCoins"
                  value={rules.scratchMaxCoins}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Gift size={18} />
              <h3>App Text</h3>
            </div>

            <div className="form-row">
              <label>Reset Text</label>
              <input
                name="scratchResetText"
                value={rules.scratchResetText}
                onChange={handleInput}
                placeholder="Resets daily at midnight"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Reward Title</label>
                <input
                  name="scratchRewardTitle"
                  value={rules.scratchRewardTitle}
                  onChange={handleInput}
                  placeholder="You won!"
                />
              </div>

              <div className="form-row">
                <label>Reward Subtitle</label>
                <input
                  name="scratchRewardSubtitle"
                  value={rules.scratchRewardSubtitle}
                  onChange={handleInput}
                  placeholder="Coins have been added to your wallet."
                />
              </div>
            </div>

            <div className="form-row">
              <label>Scratch Note</label>
              <textarea
                name="scratchNote"
                value={rules.scratchNote}
                onChange={handleInput}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Save size={18} />
            Save Scratch Rules
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ScratchCards;