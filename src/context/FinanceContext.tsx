import { LocalDB } from "@/libs/localDB/localDB";
import { supabase } from "@/libs/supabase/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

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
  source_sms_id: number | null;
  created_at: string;
  updated_at: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loadTransactions: (isCloud?: boolean) => Promise<void>;
  loadBudget: (isCloud?: boolean) => Promise<void>;
  createBudget: (
    budgetData: Partial<Budget>,
    isCloud?: boolean,
  ) => Promise<void>;
  createTransactions: (
    transactions: Partial<Transaction>[],
    isCloud?: boolean,
  ) => Promise<void>;
  getLatestSMSTransaction: (
    isCloud?: boolean,
  ) => Promise<Pick<Transaction, "transaction_date" | "source_sms_id"> | null>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [budgets, setBudget] = useState<Budget[]>([]);
  const { user } = useAuth();

  const isCloudEnabled = user?.storage_preference !== "device";

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  useEffect(() => {
    LocalDB.init();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setTransaction([]);
      setBudget([]);
      return;
    }

    const loadData = async () => {
      await Promise.all([
        loadTransactions(isCloudEnabled),
        loadBudget(isCloudEnabled),
      ]);
    };

    loadData();
  }, [user?.id, isCloudEnabled]);

  const loadTransactions = async (isCloud = isCloudEnabled) => {
    if (!user?.id) return; // Safety check

    const localData = await LocalDB.getTransactions(user.id);
    setTransaction(localData);

    if (isCloud) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate.toISOString())
        .lt("transaction_date", endDate.toISOString());

      if (error) throw error;
      if (data) {
        await LocalDB.syncTransactions(user.id, data);
        setTransaction(data);
      }
    }
  };

  const loadBudget = async (isCloud = isCloudEnabled) => {
    if (!user?.id) return; // Safety check

    const localData = await LocalDB.getBudgets(user.id);
    setBudget(localData);

    if (isCloud) {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      if (data) {
        await LocalDB.syncBudgets(user.id, data);
        setBudget(data);
      }
    }
  };

  const createBudget = async (
    budgetData: Partial<Budget>,
    isCloud = isCloudEnabled,
  ) => {
    await LocalDB.upsertBudget(budgetData);

    if (isCloud) {
      const { error } = await supabase.from("budgets").upsert(
        {
          user_id: budgetData.user_id,
          amount: Number(budgetData.amount),
          category: budgetData.category ?? "overall",
          period_type: budgetData.period_type,
          start_date: budgetData.start_date,
        },
        { onConflict: "user_id,period_type,category" },
      );
      if (error) throw error;
    }
    await loadBudget(isCloud);
  };

  const createTransactions = async (
    newTransactions: Partial<Transaction>[],
    isCloud = isCloudEnabled,
  ) => {
    await LocalDB.insertTransactions(newTransactions);

    setTransaction((prev) => {
      const updated = [...(newTransactions as Transaction[]), ...prev];
      return updated.sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime(),
      );
    });

    if (isCloud) {
      const { error } = await supabase
        .from("transactions")
        .insert(newTransactions);
      if (error) console.error("Cloud sync failed:", error);
    }
  };

  const getLatestSMSTransaction = async (isCloud = isCloudEnabled) => {
    if (!user?.id) return null; // Safety check

    const localLatest = await LocalDB.getLatestSMSTransaction(user.id);
    if (localLatest || !isCloud) return localLatest;

    const { data, error } = await supabase
      .from("transactions")
      .select("transaction_date, source_sms_id")
      .eq("source", "sms")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("source_sms_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  return (
    <TransactionContext.Provider
      value={{
        budgets,
        transactions,
        loadTransactions,
        loadBudget,
        createBudget,
        createTransactions,
        getLatestSMSTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) throw new Error("must be inside the provider");
  return context;
};
