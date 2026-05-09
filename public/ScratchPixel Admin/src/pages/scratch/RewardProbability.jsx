import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, ArrowLeft, RefreshCcw } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import { getScratchRules } from "../../services/scratchService";

function RewardProbability() {
  const [rules, setRules] = useState({
    scratchMinCoins: 1,
    scratchMaxCoins: 20,
    freeScratchPerDay: 1,
    scratchEnabled: true,
  });

  const [loading, setLoading] = useState(true);
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
        scratchMinCoins: data.scratchMinCoins ?? data.minCoins ?? 1,
        scratchMaxCoins: data.scratchMaxCoins ?? data.maxCoins ?? 20,
        freeScratchPerDay: data.freeScratchPerDay ?? 1,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load reward settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  if (loading) return <Loader text="Loading reward probability..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reward Probability</h2>
          <p>Scratch rewards are currently controlled by min/max coin range.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadRules}>
            <RefreshCcw size={18} />
            Reload
          </Button>

          <Link to="/scratch-cards" className="secondary-button">
            <ArrowLeft size={18} />
            Back to Scratch Rules
          </Link>
        </div>
      </div>

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
          title="Minimum Coins"
          value={rules.scratchMinCoins}
          icon={Gift}
        />

        <StatCard
          title="Maximum Coins"
          value={rules.scratchMaxCoins}
          icon={Gift}
        />
      </div>

      <div className="card form-card">
        <div className="settings-section">
          <div className="section-title">
            <Gift size={18} />
            <h3>Current Reward Logic</h3>
          </div>

          <p style={{ color: "var(--muted)", fontWeight: 700, lineHeight: 1.6 }}>
            The user app gives scratch rewards using the admin-set minimum and
            maximum coin values. Probability buckets are not used in the current
            app logic.
          </p>

          <div className="warning-box">
            Keep the reward range small until AdMob revenue and retention data
            are stable. Probability-based rewards can be added later if needed.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RewardProbability;