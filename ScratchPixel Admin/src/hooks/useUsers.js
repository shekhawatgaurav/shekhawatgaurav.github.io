import { useEffect, useState } from "react";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserCoins,
  blockUser,
  unblockUser,
  addCoinsToUser,
  removeCoinsFromUser,
} from "../services/userService";

export default function useUsers(autoLoad = true) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState("");

  function safeNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async function loadUsers(maxLimit = 100) {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers(maxLimit);
      setUsers(data);

      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load users.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function loadUserById(userId) {
    if (!userId) {
      setSelectedUser(null);
      setError("User ID is missing.");
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getUserById(userId);
      setSelectedUser(data);

      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load user details.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function updateUserInState(userId, updates) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );

    setSelectedUser((current) =>
      current?.id === userId ? { ...current, ...updates } : current
    );
  }

  function updateUserCoinsInState(userId, updater) {
    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== userId) return user;

        const currentCoins = safeNumber(user.coins, 0);
        const nextCoins = updater(currentCoins);

        return {
          ...user,
          coins: Math.max(0, nextCoins),
        };
      })
    );

    setSelectedUser((current) => {
      if (current?.id !== userId) return current;

      const currentCoins = safeNumber(current.coins, 0);
      const nextCoins = updater(currentCoins);

      return {
        ...current,
        coins: Math.max(0, nextCoins),
      };
    });
  }

  async function changeUserStatus(userId, status) {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      await updateUserStatus(userId, status);

      updateUserInState(userId, {
        status,
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update user status.");
      return false;
    }
  }

  async function changeUserCoins(
    userId,
    coins,
    note = "Coins updated by admin"
  ) {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      const finalCoins = safeNumber(coins, 0);

      if (finalCoins < 0) {
        setError("Coins cannot be negative.");
        return false;
      }

      await updateUserCoins(userId, finalCoins, note);

      updateUserInState(userId, {
        coins: finalCoins,
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update user coins.");
      return false;
    }
  }

  async function creditUserCoins(
    userId,
    coins,
    note = "Coins added by admin"
  ) {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      const coinValue = safeNumber(coins, 0);

      if (coinValue <= 0) {
        setError("Coins must be greater than 0.");
        return false;
      }

      await addCoinsToUser(userId, coinValue, note);

      updateUserCoinsInState(userId, (currentCoins) => currentCoins + coinValue);

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to add coins.");
      return false;
    }
  }

  async function debitUserCoins(
    userId,
    coins,
    note = "Coins removed by admin"
  ) {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      const coinValue = safeNumber(coins, 0);

      if (coinValue <= 0) {
        setError("Coins must be greater than 0.");
        return false;
      }

      const currentCoins = safeNumber(selectedUser?.coins, 0);

      if (selectedUser?.id === userId && coinValue > currentCoins) {
        setError("Debit coins cannot be greater than current user balance.");
        return false;
      }

      await removeCoinsFromUser(userId, coinValue, note);

      updateUserCoinsInState(userId, (currentCoins) => currentCoins - coinValue);

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to remove coins.");
      return false;
    }
  }

  async function blockSelectedUser(userId, reason = "Blocked by admin") {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      await blockUser(userId, reason);

      updateUserInState(userId, {
        status: "blocked",
        blockReason: reason,
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to block user.");
      return false;
    }
  }

  async function unblockSelectedUser(userId) {
    if (!userId) {
      setError("User ID is missing.");
      return false;
    }

    try {
      setError("");

      await unblockUser(userId);

      updateUserInState(userId, {
        status: "active",
        blockReason: "",
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to unblock user.");
      return false;
    }
  }

  useEffect(() => {
    if (autoLoad) {
      loadUsers();
    }
  }, [autoLoad]);

  return {
    users,
    selectedUser,
    loading,
    error,

    setUsers,
    setSelectedUser,
    setError,

    loadUsers,
    loadUserById,

    changeUserStatus,
    changeUserCoins,
    creditUserCoins,
    debitUserCoins,

    blockSelectedUser,
    unblockSelectedUser,
  };
}