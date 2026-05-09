import { useState } from "react";
import { LogOut, Menu, Moon, ShieldCheck, Sun } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ConfirmDialog from "../common/ConfirmDialog";

function Header({ onMenuClick }) {
  const { adminData, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  return (
    <>
      <header className="admin-header">
        <div className="header-left">
          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1>Admin Console</h1>
            <p>Manage users, rewards, withdrawals and security.</p>
          </div>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>{adminData?.name || "Admin"}</strong>
              <span>{adminData?.role || "support"}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={logoutOpen}
        title="Logout?"
        message="Are you sure you want to logout from the admin panel?"
        confirmText="Logout"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => {
          if (!loggingOut) setLogoutOpen(false);
        }}
      />
    </>
  );
}

export default Header;