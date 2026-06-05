import { LocalDB } from "@/libs/localDB/localDB";
import { supabase } from "@/libs/supabase/client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID!,
});

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  onboardingCompleted?: boolean;
  storage_preference: "cloud" | "device";
}

export interface Budget {
  id: string;
  user_id: string;
  category: string | null;
  amount: number;
  period_type: "weekly" | "monthly" | "yearly";
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "credit" | "debit";
  category: string | null;
  merchant_name: string | null;
  transaction_date: string;
  source: "sms" | "manual";
  is_auto_detected: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  userNameAvailability: (username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateStoragePreference: (preference: "cloud" | "device") => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();

    Linking.getInitialURL().then((url) => handleDeepLink(url));

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string | null) => {
    if (!url) return;

    const paramsStr = url.split("#")[1] || url.split("?")[1];
    if (!paramsStr) return;

    const params = paramsStr.split("&").reduce(
      (acc, current) => {
        const [key, value] = current.split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    if (params.error_description) {
      const errorMessage = decodeURIComponent(
        params.error_description.replace(/\+/g, " "),
      );
      Alert.alert("Link Invalid", errorMessage);

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);

      return;
    }

    if (params.access_token && params.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });

      if (!error) {
        checkSession();
      } else {
        console.error("Error setting session from URL:", error.message);
      }
    }
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking session: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile: ", error);
        return null;
      }
      if (!data) {
        console.error("No profile data returned");
        return null;
      }

      const authUser = await supabase.auth.getUser();
      if (!authUser.data.user) {
        console.error("User does not exist");
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        username: data.username,
        email: authUser.data.user.email || "",
        onboardingCompleted: data.onboarding_completed,
        storage_preference: data.storage_preference,
      };
    } catch (error) {
      console.log("Error in fetchUserProfile: ", error);
      return null;
    }
  };

  const updateStoragePreference = async (preference: "cloud" | "device") => {
    if (!user?.id) return;

    try {
      if (preference === "cloud" && user.storage_preference === "device") {
        const localTransactions = await LocalDB.getTransactions(user.id);
        const localBudgets = await LocalDB.getBudgets(user.id);

        if (localTransactions.length > 0) {
          const formattedTransactions = localTransactions.map((t) => ({
            id: t.id,
            user_id: t.user_id,
            amount: Number(t.amount),
            transaction_type: t.transaction_type,
            category: t.category,
            merchant_name: t.merchant_name,
            transaction_date: t.transaction_date,
            source: t.source,
            is_auto_detected: Boolean(t.is_auto_detected),
            source_sms_id: t.source_sms_id,
          }));

          const { error } = await supabase
            .from("transactions")
            .upsert(formattedTransactions);
          if (error) throw error;
        }

        if (localBudgets.length > 0) {
          const formattedBudgets = localBudgets.map((b) => ({
            id: b.id,
            user_id: b.user_id,
            category: b.category ?? "overall",
            amount: Number(b.amount),
            period_type: b.period_type,
            start_date: b.start_date,
            created_at: b.created_at,
            updated_at: b.updated_at,
          }));
          const { error } = await supabase
            .from("budgets")
            .upsert(formattedBudgets);
          if (error) throw error;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({ storage_preference: preference })
        .eq("id", user.id);

      if (error) throw error;

      setUser((prev) =>
        prev ? { ...prev, storage_preference: preference } : null,
      );
    } catch (error) {
      console.error("Failed to update preference", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setUser(profile);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "spendwise://login",
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "success") {
        const idToken = response.data.idToken;

        if (!idToken) throw new Error("No ID token returned");

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (error) throw error;

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id);
          setUser(profile);
        }
      } else {
        // Handle 'cancelled' or other non-success states gracefully
        console.log("Google Sign-In was cancelled or failed:", response.type);
        return;
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "spendwise://update-password",
    });

    if (error) throw error;
  };

  // Add inside AuthProvider:
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const userNameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username);

      if (error) {
        console.error(error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.username !== undefined)
        updateData.username = userData.username;
      if (userData.onboardingCompleted !== undefined)
        updateData.onboarding_completed = userData.onboardingCompleted;

      const { error, data } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;

      if (data) {
        const profile = await fetchUserProfile(data.id);
        setUser(profile);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        userNameAvailability,
        updateUser,
        updateStoragePreference,
        signInWithGoogle,
        sendPasswordResetEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("must be inside the provider");
  }
  return context;
};
