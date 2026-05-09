import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Gift,
  Video,
  CheckSquare,
  Share2,
  BadgeIndianRupee,
  BadgeCheck,
  ShieldAlert,
  Bell,
  LifeBuoy,
  BarChart3,
  FileText,
  UserCog,
  Settings,
  ScrollText,
  X,
  Smartphone,
} from "lucide-react";

import { getAdminSidebarBadges } from "../../services/adminBadgeService";
import logo from "../../assets/logo.png";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    badgeKey: "users",
  },
  {
    label: "Wallet & Coins",
    path: "/wallet/settings",
    icon: Wallet,
  },
  {
    label: "Scratch Cards",
    path: "/scratch-cards",
    icon: Gift,
  },
  {
    label: "Ads Rewards",
    path: "/ads-rewards",
    icon: Video,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Referrals",
    path: "/referrals",
    icon: Share2,
    badgeKey: "referrals",
  },
  {
    label: "Withdrawals",
    path: "/withdrawals",
    icon: BadgeIndianRupee,
    badgeKey: "withdrawals",
  },
  {
    label: "KYC",
    path: "/kyc",
    icon: BadgeCheck,
    badgeKey: "kyc",
  },
  {
    label: "Fraud Center",
    path: "/fraud-center",
    icon: ShieldAlert,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Support",
    path: "/support",
    icon: LifeBuoy,
    badgeKey: "support",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Content",
    path: "/content",
    icon: FileText,
  },
  {
    label: "Admin Staff",
    path: "/admins",
    icon: UserCog,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    label: "Version Control",
    path: "/settings/version-control",
    icon: Smartphone,
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: ScrollText,
  },
];

function Sidebar({ isOpen = false, onClose }) {
  const [badges, setBadges] = useState({});

  async function loadBadges() {
    try {
      const data = await getAdminSidebarBadges();
      setBadges(data || {});
    } catch (error) {
      console.error("Unable to load sidebar badges:", error);
      setBadges({});
    }
  }

  useEffect(() => {
    loadBadges();

    const interval = setInterval(loadBadges, 30000);

    return () => clearInterval(interval);
  }, []);

  function handleClose() {
    if (onClose) onClose();
  }

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <img src={logo} alt="Scratch Pixel Logo" style={{ height: "40px", width: "40px", borderRadius: "8px", objectFit: "cover" }} />

        <div>
          <h2>Scratch Pixel</h2>
          <p>Admin Panel</p>
        </div>

        <button
          type="button"
          className="icon-button sidebar-close"
          onClick={handleClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? Number(badges[item.badgeKey] || 0) : 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/settings"}
              onClick={handleClose}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>

              {badgeCount > 0 && (
                <span className="sidebar-badge">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
