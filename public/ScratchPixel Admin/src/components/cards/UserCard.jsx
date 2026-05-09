import Badge from "../common/Badge";
import Button from "../common/Button";
import { formatCoins } from "../../utils/formatCurrency";

function getAvatarLabel(user) {
  return (user?.name || user?.email || "U").charAt(0).toUpperCase();
}

function getAvatarColor(avatarId) {
  const colors = {
    avatar_1: "#7C3AED",
    avatar_2: "#0EA5E9",
    avatar_3: "#10B981",
    avatar_4: "#F59E0B",
    avatar_5: "#EF4444",
    avatar_6: "#EC4899",
    avatar_7: "#14B8A6",
    avatar_8: "#6366F1",
    avatar_9: "#84CC16",
    avatar_10: "#8B5CF6",
  };

  return colors[avatarId] || colors.avatar_1;
}

function getStatusType(status) {
  if (status === "active") return "success";
  if (status === "blocked") return "danger";
  if (status === "suspended") return "warning";
  return "muted";
}

function getRiskType(riskStatus) {
  if (riskStatus === "high-risk") return "danger";
  if (riskStatus === "suspicious") return "warning";
  return "success";
}

function UserCard({
  user,
  onView,
  onBlock,
  onUnblock,
  className = "",
}) {
  const status = user?.status || "active";
  const riskStatus = user?.riskStatus || "normal";
  const avatarColor = getAvatarColor(user?.avatarId);

  return (
    <div className={`card user-card ${className}`}>
      <div className="user-card-top">
        <div
          className="user-avatar"
          style={{
            background: avatarColor,
          }}
          title={user?.avatarId || "avatar_1"}
        >
          {getAvatarLabel(user)}
        </div>

        <div>
          <h3>{user?.name || "Unnamed User"}</h3>
          <p>{user?.email || user?.phone || user?.id || "No contact info"}</p>

          <small style={{ color: "var(--muted)", fontWeight: 800 }}>
            {user?.gender ? String(user.gender).toUpperCase() : "GENDER NOT ADDED"} ·{" "}
            {user?.avatarId || "avatar_1"}
          </small>
        </div>
      </div>

      <div className="user-card-stats">
        <div>
          <span>Coins</span>
          <strong>{formatCoins(user?.coins || 0)}</strong>
        </div>

        <div>
          <span>Risk</span>
          <strong>
            <Badge type={getRiskType(riskStatus)} dot>
              {riskStatus}
            </Badge>
          </strong>
        </div>

        <div>
          <span>Referrals</span>
          <strong>{user?.referralCount || 0}</strong>
        </div>
      </div>

      <div className="user-card-footer">
        <Badge type={getStatusType(status)} dot>
          {status}
        </Badge>

        <div className="actions" style={{ marginTop: 0 }}>
          {onView && (
            <Button size="sm" variant="secondary" onClick={() => onView(user)}>
              View
            </Button>
          )}

          {status === "blocked" && onUnblock && (
            <Button size="sm" variant="success" onClick={() => onUnblock(user)}>
              Unblock
            </Button>
          )}

          {status !== "blocked" && onBlock && (
            <Button size="sm" variant="danger" onClick={() => onBlock(user)}>
              Block
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCard;