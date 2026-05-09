import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Coins,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCcw,
  Wallet,
  ListChecks,
} from "lucide-react";

import useUsers from "../../hooks/useUsers";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function UserDetails() {
  const { userId } = useParams();

  const {
    selectedUser,
    loading,
    error,
    loadUserById,
    blockSelectedUser,
    unblockSelectedUser,
  } = useUsers(false);

  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [confirmData, setConfirmData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUserById(userId);
  }, [userId]);

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  function getStatusType(status) {
    const value = normalize(status, "active");

    if (value === "active") return "success";
    if (value === "blocked") return "danger";
    if (value === "suspended") return "warning";

    return "muted";
  }

  function getRiskType(riskStatus) {
    const value = normalize(riskStatus, "normal");

    if (value === "high-risk") return "danger";
    if (value === "suspicious") return "warning";

    return "success";
  }

  function getKycType(status) {
    const value = normalize(status, "not_submitted");

    if (value === "approved") return "success";
    if (value === "rejected") return "danger";
    if (value === "pending") return "warning";

    return "muted";
  }

  function openBlockConfirm() {
    setMessage("");
    setLocalError("");

    setConfirmData({
      action: "block",
      title: "Block User?",
      message: "This user will be blocked from app activity and withdrawals.",
      reason: "Blocked from user details",
    });
  }

  function openUnblockConfirm() {
    setMessage("");
    setLocalError("");

    setConfirmData({
      action: "unblock",
      title: "Unblock User?",
      message: "This user will be reactivated and can use the app again.",
      reason: "",
    });
  }

  async function handleConfirm() {
    if (!confirmData) return;

    try {
      setProcessing(true);
      setMessage("");
      setLocalError("");

      if (confirmData.action === "block") {
        await blockSelectedUser(
          userId,
          confirmData.reason || "Blocked from user details"
        );

        setMessage("User blocked successfully.");
      }

      if (confirmData.action === "unblock") {
        await unblockSelectedUser(userId);
        setMessage("User unblocked successfully.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setLocalError(err.message || "Unable to update user status.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Loader text="Loading user details..." />;

  if (!selectedUser) {
    return (
      <div className="empty-page">
        <div className="empty-card">
          <h1>User Not Found</h1>
          <p>This user does not exist.</p>
          <Link to="/users" className="primary-button">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const status = normalize(selectedUser.status, "active");
  const riskStatus = normalize(selectedUser.riskStatus, "normal");
  const kycStatus =
    selectedUser.kycStatus || selectedUser.kyc?.status || "not_submitted";

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Details</h2>
          <p>View user profile, wallet, referral, security and account status.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={() => loadUserById(userId)}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Link to="/users" className="secondary-button">
            Back
          </Link>

          <Link to={`/users/${userId}/transactions`} className="secondary-button">
            <ListChecks size={18} />
            Transactions
          </Link>

          <Link to={`/users/${userId}/wallet`} className="secondary-button">
            <Wallet size={18} />
            Wallet
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {(error || localError) && (
        <div className="error-box">{localError || error}</div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Coins"
          value={formatCoins(selectedUser.coins || 0)}
          icon={Coins}
        />

        <StatCard
          title="Status"
          value={status}
          icon={status === "blocked" ? UserX : UserCheck}
          variant={status === "blocked" ? "danger" : "success"}
        />

        <StatCard
          title="Risk"
          value={riskStatus}
          icon={ShieldAlert}
          variant={getRiskType(riskStatus)}
        />

        <StatCard
          title="Referrals"
          value={selectedUser.referralCount || 0}
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Profile Information</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Name</span>
              <strong>{selectedUser.name || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <strong>{selectedUser.email || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Phone</span>
              <strong>{selectedUser.phone || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Gender</span>
              <strong>
                {selectedUser.gender
                  ? String(selectedUser.gender).toUpperCase()
                  : "Not added"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Avatar ID</span>
              <strong>{selectedUser.avatarId || "avatar_1"}</strong>
            </div>

            <div className="detail-item">
              <span>UPI ID</span>
              <strong>{selectedUser.upiId || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>
                <Badge type={getStatusType(status)} dot>
                  {status}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Risk Status</span>
              <strong>
                <Badge type={getRiskType(riskStatus)} dot>
                  {riskStatus}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Joined</span>
              <strong>{formatDateTime(selectedUser.createdAt)}</strong>
            </div>

            <div className="detail-item">
              <span>User ID</span>
              <strong>{selectedUser.id}</strong>
            </div>
          </div>

          <div className="actions">
            {status === "blocked" ? (
              <Button variant="success" onClick={openUnblockConfirm}>
                <UserCheck size={18} />
                Unblock User
              </Button>
            ) : (
              <Button variant="danger" onClick={openBlockConfirm}>
                <UserX size={18} />
                Block User
              </Button>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Reward & Verification</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Current Coins</span>
              <strong>{formatCoins(selectedUser.coins || 0)}</strong>
            </div>

            <div className="detail-item">
              <span>KYC Status</span>
              <strong>
                <Badge type={getKycType(kycStatus)} dot>
                  {kycStatus}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Referral Code</span>
              <strong>{selectedUser.referralCode || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Referral Count</span>
              <strong>{selectedUser.referralCount || 0}</strong>
            </div>

            <div className="detail-item">
              <span>Signup Bonus</span>
              <strong>{selectedUser.signupBonusGiven ? "Given" : "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Last Login</span>
              <strong>{formatDateTime(selectedUser.lastLoginAt)}</strong>
            </div>
          </div>

          <div className="warning-box">
            Manual coin credit/debit is now handled from the Wallet page so the
            adjustment is also recorded in wallet transactions.
          </div>

          <div className="actions">
            <Link to={`/users/${userId}/wallet`} className="primary-button">
              <Wallet size={18} />
              Open Wallet Control
            </Link>

            <Link
              to={`/users/${userId}/transactions`}
              className="secondary-button"
            >
              View Transactions
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Device & Fraud Info</h3>

        <div className="detail-list">
          <div className="detail-item">
            <span>Device ID</span>
            <strong>{selectedUser.deviceId || "N/A"}</strong>
          </div>

          <div className="detail-item">
            <span>Device Name</span>
            <strong>{selectedUser.deviceName || "N/A"}</strong>
          </div>

          <div className="detail-item">
            <span>IP Address</span>
            <strong>{selectedUser.ipAddress || "N/A"}</strong>
          </div>

          <div className="detail-item">
            <span>App Version</span>
            <strong>{selectedUser.appVersion || "N/A"}</strong>
          </div>

          <div className="detail-item">
            <span>Block Reason</span>
            <strong>{selectedUser.blockReason || "N/A"}</strong>
          </div>

          <div className="detail-item">
            <span>Fraud Reason</span>
            <strong>{selectedUser.fraudReason || "N/A"}</strong>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Confirm"
        variant={confirmData?.action === "unblock" ? "success" : "danger"}
        loading={processing}
        onCancel={() => {
          if (!processing) setConfirmData(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default UserDetails;