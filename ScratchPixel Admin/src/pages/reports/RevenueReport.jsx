import { useEffect, useState } from "react";
import { BadgeIndianRupee, Coins, Download, RefreshCcw } from "lucide-react";

import StatCard from "../../components/cards/StatCard";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getDashboardStats } from "../../services/reportService";
import { getAppSettings } from "../../services/settingsService";
import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { downloadCSV } from "../../utils/helpers";

function RevenueReport() {
  const [stats, setStats] = useState(null);

  const [settings, setSettings] = useState({
    estimatedRevenuePerAd: 0.03,
    rewardedAdCoins: 5,
    maxDailyAds: 20,
    coinValue: 100,
  });

  const [estimatedAdsWatched, setEstimatedAdsWatched] = useState(0);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async function loadRevenueReport() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [statsData, settingsData] = await Promise.all([
        getDashboardStats(),
        getAppSettings(),
      ]);

      setStats(statsData);

      setSettings((current) => ({
        ...current,
        ...settingsData,
        estimatedRevenuePerAd:
          settingsData.estimatedRevenuePerAd ?? current.estimatedRevenuePerAd,
      }));

      const rewardedAdCoins = toNumber(settingsData.rewardedAdCoins, 5);

      const roughAds =
        rewardedAdCoins > 0
          ? toNumber(statsData.totalCoins, 0) / rewardedAdCoins
          : 0;

      setEstimatedAdsWatched(Math.max(0, Math.round(roughAds)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load revenue report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenueReport();
  }, []);

  const safeEstimatedAdsWatched = Math.max(
    0,
    toNumber(estimatedAdsWatched, 0)
  );

  const safeRevenuePerAd = Math.max(
    0,
    toNumber(settings.estimatedRevenuePerAd, 0.03)
  );

  const estimatedRevenue = safeEstimatedAdsWatched * safeRevenuePerAd;

  const totalPayout = toNumber(stats?.totalWithdrawalAmount, 0);
  const estimatedProfit = estimatedRevenue - totalPayout;

  function exportRevenue() {
    downloadCSV("revenue-report.csv", [
      {
        estimatedAdsWatched: safeEstimatedAdsWatched,
        estimatedRevenuePerAd: safeRevenuePerAd,
        estimatedRevenue,
        totalCoins: stats?.totalCoins || 0,
        totalWithdrawalAmount: stats?.totalWithdrawalAmount || 0,
        estimatedProfit,
      },
    ]);

    setMessage("Revenue report exported successfully.");
  }

  function handleRevenuePerAdChange(e) {
    const value = e.target.value;

    if (Number(value) < 0) {
      setError("Estimated revenue per ad cannot be negative.");
      return;
    }

    setError("");

    setSettings((current) => ({
      ...current,
      estimatedRevenuePerAd: value,
    }));
  }

  function handleEstimatedAdsChange(e) {
    const value = e.target.value;

    if (Number(value) < 0) {
      setError("Estimated ads watched cannot be negative.");
      return;
    }

    setError("");
    setEstimatedAdsWatched(value);
  }

  const rows = [
    {
      id: "ads",
      metric: "Estimated Ads Watched",
      value: formatCoins(safeEstimatedAdsWatched),
      note: "Calculated roughly from total coins divided by rewarded ad coins. You can edit this estimate manually.",
    },
    {
      id: "revenue-per-ad",
      metric: "Estimated Revenue Per Ad",
      value: formatCurrency(safeRevenuePerAd),
      note: "Manual estimate. Real value must be checked in AdMob dashboard.",
    },
    {
      id: "revenue",
      metric: "Estimated Revenue",
      value: formatCurrency(estimatedRevenue),
      note: "Estimated ads watched multiplied by estimated revenue per ad.",
    },
    {
      id: "payout",
      metric: "Total Withdrawal Amount",
      value: formatCurrency(totalPayout),
      note: "Based on withdrawal stats from your Firestore data.",
    },
    {
      id: "profit",
      metric: "Estimated Profit / Loss",
      value: formatCurrency(estimatedProfit),
      note: "Estimated revenue minus total withdrawal amount.",
    },
  ];

  const columns = [
    {
      key: "metric",
      label: "Metric",
      render: (row) => <strong>{row.metric}</strong>,
    },
    {
      key: "value",
      label: "Value",
    },
    {
      key: "note",
      label: "Note",
    },
  ];

  if (loading) return <Loader text="Loading revenue report..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Revenue Report</h2>
          <p>Estimate ad revenue, payout cost and rough profit/loss.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadRevenueReport}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportRevenue}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="warning-box">
        This report is an estimate. Real AdMob revenue must be checked inside
        your AdMob dashboard. Free Firebase does not automatically fetch AdMob
        revenue.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Total Coins"
          value={formatCoins(stats?.totalCoins || 0)}
          icon={Coins}
        />

        <StatCard
          title="Estimated Ads"
          value={formatCoins(safeEstimatedAdsWatched)}
          icon={Coins}
        />

        <StatCard
          title="Estimated Revenue"
          value={formatCurrency(estimatedRevenue)}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Estimated Profit"
          value={formatCurrency(estimatedProfit)}
          icon={BadgeIndianRupee}
          variant={estimatedProfit >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="card form-card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>Estimate Settings</h3>

        <div className="grid grid-2">
          <div className="form-row">
            <label>Estimated Revenue Per Ad ₹</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.estimatedRevenuePerAd}
              onChange={handleRevenuePerAdChange}
            />
            <small>Example: 0.03 means ₹0.03 per rewarded ad estimate.</small>
          </div>

          <div className="form-row">
            <label>Estimated Ads Watched</label>
            <input
              type="number"
              min="0"
              value={estimatedAdsWatched}
              onChange={handleEstimatedAdsChange}
            />
            <small>You can manually adjust this based on AdMob dashboard.</small>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Revenue Breakdown</h3>
        </div>

        <Table
          columns={columns}
          data={rows}
          emptyText="No revenue rows found."
          showIndex
        />
      </div>
    </div>
  );
}

export default RevenueReport;