import * as SQLite from "expo-sqlite";
import { Budget, Transaction } from "../../context/FinanceContext";

// Opens or creates the database file synchronously
const db = SQLite.openDatabaseSync("finance.db");

export const LocalDB = {
  // ── 1. INITIALIZATION ──
  init: () => {
    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        category TEXT,
        merchant_name TEXT,
        transaction_date TEXT NOT NULL,
        source TEXT NOT NULL,
        is_auto_detected INTEGER,
        created_at TEXT,
        updated_at TEXT,
        source_sms_id INTEGER UNIQUE
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        period_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      );
    `);
  },

  // ── 2. TRANSACTIONS CRUD ──
  getTransactions: async (): Promise<Transaction[]> => {
    const data = await db.getAllAsync<Transaction>(
      "SELECT * FROM transactions ORDER BY transaction_date DESC",
    );
    return data.map((t) => ({
      ...t,
      is_auto_detected: Boolean(t.is_auto_detected),
    }));
  },

  insertTransactions: async (transactions: Partial<Transaction>[]) => {
    const statement = await db.prepareAsync(`
      INSERT OR REPLACE INTO transactions
      (id, user_id, amount, transaction_type, category, merchant_name, transaction_date, source, is_auto_detected, source_sms_id, created_at, updated_at)
      VALUES ($id, $user_id, $amount, $transaction_type, $category, $merchant_name, $transaction_date, $source, $is_auto_detected, $source_sms_id, $created_at, $updated_at)
    `);

    try {
      for (const t of transactions) {
        // Strict typing to prevent SQLiteBlob errors
        await statement.executeAsync({
          $id: t.id ?? Math.random().toString(),
          $user_id: t.user_id!,
          $amount: t.amount!,
          $transaction_type: t.transaction_type!,
          $category: t.category ?? null,
          $merchant_name: t.merchant_name ?? null,
          $transaction_date: t.transaction_date!,
          $source: t.source!,
          $is_auto_detected: t.is_auto_detected ? 1 : 0,
          $source_sms_id: t.source_sms_id ?? null,
          $created_at: t.created_at ?? new Date().toISOString(),
          $updated_at: t.updated_at ?? new Date().toISOString(),
        });
      }
    } finally {
      await statement.finalizeAsync();
    }
  },

  syncTransactions: async (transactions: Transaction[]) => {
    db.execSync("DELETE FROM transactions");
    await LocalDB.insertTransactions(transactions);
  },

  // ── 3. BUDGETS CRUD ──
  getBudgets: async (): Promise<Budget[]> => {
    return db.getAllAsync<Budget>("SELECT * FROM budgets");
  },

  upsertBudget: async (b: Partial<Budget>) => {
    await db.runAsync(
      `
      INSERT OR REPLACE INTO budgets (id, user_id, category, amount, period_type, start_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        b.id ?? Math.random().toString(),
        b.user_id!,
        b.category ?? "overall",
        b.amount!,
        b.period_type!,
        b.start_date!,
        b.created_at ?? new Date().toISOString(),
        b.updated_at ?? new Date().toISOString(),
      ],
    );
  },

  syncBudgets: async (budgets: Budget[]) => {
    db.execSync("DELETE FROM budgets");
    for (const b of budgets) await LocalDB.upsertBudget(b);
  },

  // ── 4. UTILS ──
  getLatestSMSTransaction: async () => {
    const data = await db.getFirstAsync<Transaction>(`
      SELECT transaction_date, source_sms_id FROM transactions
      WHERE source = 'sms' ORDER BY transaction_date DESC, source_sms_id DESC LIMIT 1
    `);
    return data ?? null;
  },
};
