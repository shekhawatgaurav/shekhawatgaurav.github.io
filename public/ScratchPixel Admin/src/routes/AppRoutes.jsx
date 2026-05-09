import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import Users from "../pages/users/Users";
import UserDetails from "../pages/users/UserDetails";
import UserWallet from "../pages/users/UserWallet";
import UserTransactions from "../pages/users/UserTransactions";

import ScratchCards from "../pages/scratch/ScratchCards";
import ScratchRules from "../pages/scratch/ScratchRules";
import RewardProbability from "../pages/scratch/RewardProbability";

import AdsRewards from "../pages/ads/AdsRewards";
import AdSettings from "../pages/ads/AdSettings";

import Tasks from "../pages/tasks/Tasks";
import CreateTask from "../pages/tasks/CreateTask";
import TaskDetails from "../pages/tasks/TaskDetails";

import Referrals from "../pages/referrals/Referrals";
import ReferralSettings from "../pages/referrals/ReferralSettings";

import Withdrawals from "../pages/withdrawals/Withdrawals";
import PendingWithdrawals from "../pages/withdrawals/PendingWithdrawals";
import ApprovedWithdrawals from "../pages/withdrawals/ApprovedWithdrawals";
import RejectedWithdrawals from "../pages/withdrawals/RejectedWithdrawals";

import KycRequests from "../pages/kyc/KycRequests";
import KycDetails from "../pages/kyc/KycDetails";
import KycSettings from "../pages/kyc/KycSettings";

import FraudCenter from "../pages/fraud/FraudCenter";
import SuspiciousUsers from "../pages/fraud/SuspiciousUsers";
import FraudRules from "../pages/fraud/FraudRules";

import Notifications from "../pages/notifications/Notifications";
import SendNotification from "../pages/notifications/SendNotification";

import SupportTickets from "../pages/support/SupportTickets";
import TicketDetails from "../pages/support/TicketDetails";

import Reports from "../pages/reports/Reports";
import RevenueReport from "../pages/reports/RevenueReport";
import UserReport from "../pages/reports/UserReport";
import WithdrawalReport from "../pages/reports/WithdrawalReport";

import AppContent from "../pages/content/AppContent";
import Banners from "../pages/content/Banners";
import Terms from "../pages/content/Terms";
import PrivacyPolicy from "../pages/content/PrivacyPolicy";

import WalletSettings from "../pages/wallet/WalletSettings";
import CoinRules from "../pages/wallet/CoinRules";
import ManualCoinAdjust from "../pages/wallet/ManualCoinAdjust";

import AppSettings from "../pages/settings/AppSettings";
import PaymentSettings from "../pages/settings/PaymentSettings";
import SecuritySettings from "../pages/settings/SecuritySettings";
import VersionControl from "../pages/settings/VersionControl";

import AuditLogs from "../pages/audit/AuditLogs";

import AdminStaff from "../pages/admins/AdminStaff";
import CreateAdmin from "../pages/admins/CreateAdmin";
import RolesPermissions from "../pages/admins/RolesPermissions";

import NotFound from "../pages/error/NotFound";
import Unauthorized from "../pages/error/Unauthorized";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />

          {/* Users */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<UserDetails />} />
          <Route path="/users/:userId/wallet" element={<UserWallet />} />
          <Route
            path="/users/:userId/transactions"
            element={<UserTransactions />}
          />

          {/* Scratch */}
          <Route path="/scratch-cards" element={<ScratchCards />} />
          <Route path="/scratch-cards/rules" element={<ScratchRules />} />
          <Route
            path="/scratch-cards/probability"
            element={<RewardProbability />}
          />

          {/* Ads */}
          <Route path="/ads-rewards" element={<AdsRewards />} />
          <Route path="/ad-settings" element={<AdSettings />} />

          {/* Tasks */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />

          {/* Referrals */}
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/referrals/settings" element={<ReferralSettings />} />

          {/* Withdrawals */}
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/withdrawals/pending" element={<PendingWithdrawals />} />
          <Route
            path="/withdrawals/approved"
            element={<ApprovedWithdrawals />}
          />
          <Route
            path="/withdrawals/rejected"
            element={<RejectedWithdrawals />}
          />

          {/* KYC */}
          <Route path="/kyc" element={<KycRequests />} />
          <Route path="/kyc/settings" element={<KycSettings />} />
          <Route path="/kyc/:kycId" element={<KycDetails />} />

          {/* Fraud */}
          <Route path="/fraud-center" element={<FraudCenter />} />
          <Route
            path="/fraud-center/suspicious-users"
            element={<SuspiciousUsers />}
          />
          <Route path="/fraud-center/rules" element={<FraudRules />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/send" element={<SendNotification />} />

          {/* Support */}
          <Route path="/support" element={<SupportTickets />} />
          <Route path="/support/:ticketId" element={<TicketDetails />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/revenue" element={<RevenueReport />} />
          <Route path="/reports/users" element={<UserReport />} />
          <Route path="/reports/withdrawals" element={<WithdrawalReport />} />

          {/* Content */}
          <Route path="/content" element={<AppContent />} />
          <Route path="/content/banners" element={<Banners />} />
          <Route path="/content/terms" element={<Terms />} />
          <Route path="/content/privacy-policy" element={<PrivacyPolicy />} />

          {/* Wallet */}
          <Route path="/wallet/settings" element={<WalletSettings />} />
          <Route path="/wallet/coin-rules" element={<CoinRules />} />
          <Route path="/wallet/manual-adjust" element={<ManualCoinAdjust />} />

          {/* Settings */}
          <Route path="/settings" element={<AppSettings />} />
          <Route path="/settings/payments" element={<PaymentSettings />} />
          <Route path="/settings/security" element={<SecuritySettings />} />
          <Route
            path="/settings/version-control"
            element={<VersionControl />}
          />

          {/* Audit */}
          <Route path="/audit-logs" element={<AuditLogs />} />

          {/* Admin Staff */}
          <Route path="/admins" element={<AdminStaff />} />
          <Route path="/admins/create" element={<CreateAdmin />} />
          <Route path="/admins/roles" element={<RolesPermissions />} />

          {/* System */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;
