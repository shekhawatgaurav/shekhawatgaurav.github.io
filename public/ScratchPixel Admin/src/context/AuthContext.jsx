import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminData, setAdminData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function loadAdminData(user) {
    if (!user) {
      setCurrentAdmin(null);
      setAdminData(null);
      setAuthError("");
      return null;
    }

    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await signOut(auth);

      setCurrentAdmin(null);
      setAdminData(null);
      setAuthError("Admin access is not allowed for this account.");

      return null;
    }

    const data = adminSnap.data();

    if (data.status !== "active") {
      await signOut(auth);

      setCurrentAdmin(null);
      setAdminData(null);
      setAuthError("This admin account is inactive.");

      return null;
    }

    const finalAdminData = {
      id: user.uid,
      uid: user.uid,
      email: user.email || data.email || "",
      name: data.name || user.displayName || "Admin",
      role: data.role || "support",
      status: data.status || "active",
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      ...data,
    };

    setCurrentAdmin(user);
    setAdminData(finalAdminData);
    setAuthError("");

    try {
      await updateDoc(adminRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn("Unable to update admin lastLoginAt:", error);
    }

    return finalAdminData;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      try {
        await loadAdminData(user);
      } catch (error) {
        console.error("Admin loading error:", error);

        setCurrentAdmin(null);
        setAdminData(null);
        setAuthError("Unable to verify admin access.");

        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Admin sign out error:", signOutError);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    await signOut(auth);

    setCurrentAdmin(null);
    setAdminData(null);
    setAuthError("");
  }

  const isAuthenticated =
    !!currentAdmin && !!adminData && adminData.status === "active";

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        adminData,
        loading,
        authError,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}