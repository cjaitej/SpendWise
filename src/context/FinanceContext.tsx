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
  loadTransactions: () => Promise<void>;
  loadBudget: () => Promise<void>;
  createBudget: (budgetData: Partial<Budget>) => Promise<void>;
  createTransactions: (transactions: Partial<Transaction>[]) => Promise<void>;
  getLatestSMSTransaction: () => Promise<Pick<
    Transaction,
    "transaction_date" | "source_sms_id"
  > | null>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [budgets, setBudget] = useState<Budget[]>([]);

  const { user } = useAuth();

  const now = new Date();
  // First day of previous month
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // First day of next month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  //Loading Transaction Data when app is opened.
  useEffect(() => {
    if (!user?.id) return;
    const loadData = async () => {
      await Promise.all([loadTransactions(), loadBudget()]);
    };

    loadData();
  }, [user?.id]);

  //RefreshTransactions:
  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .gte("transaction_date", startDate.toISOString())
      .lt("transaction_date", endDate.toISOString());

    if (error) throw error;
    setTransaction(data ?? []);
  };

  //RefreshBudget:
  const loadBudget = async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user?.id);
    if (error) throw error;
    setBudget(data ?? []);
  };

  //Creating Budget:
  const createBudget = async (budgetData: Partial<Budget>) => {
    const { data, error } = await supabase
      .from("budgets")
      .upsert(
        {
          user_id: budgetData.user_id,
          amount: Number(budgetData.amount),
          category: budgetData.category ?? "overall",
          period_type: budgetData.period_type,
          start_date: budgetData.start_date,
        },
        {
          onConflict: "user_id,period_type,category",
        },
      )
      .select();

    if (error) throw error;
  };

  //Creating Transactions:
  const createTransactions = async (transactions: Partial<Transaction>[]) => {
    const { error } = await supabase.from("transactions").insert(transactions);

    if (error) throw error;
  };

  //Returning Latest Transaction
  const getLatestSMSTransaction = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("transaction_date, source_sms_id")
      .eq("source", "sms")
      .order("transaction_date", { ascending: false })
      .order("source_sms_id", { ascending: false }) // <-- Add secondary sort here
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return {
      transaction_date: data?.transaction_date ?? null,
      source_sms_id: data?.source_sms_id ?? null,
    };
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
  if (context === undefined) {
    throw new Error("must be inside the provider");
  }
  return context;
};
