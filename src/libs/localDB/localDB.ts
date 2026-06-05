import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { Budget, Transaction } from "../../context/FinanceContext";

// Opens or creates the database file synchronously
const db = SQLite.openDatabaseSync("finance.db");

export const LocalDB = {
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
        source_sms_id INTEGER,
        UNIQUE(user_id, source_sms_id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        period_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(user_id, period_type, category)
      );
    `);
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const data = await db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC",
      [userId],
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
        await statement.executeAsync({
          $id: t.id ?? Crypto.randomUUID(),
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

  syncTransactions: async (userId: string, transactions: Transaction[]) => {
    // Only delete the active user's transactions before syncing
    await db.runAsync("DELETE FROM transactions WHERE user_id = ?", [userId]);
    await LocalDB.insertTransactions(transactions);
  },

  syncBudgets: async (userId: string, budgets: Budget[]) => {
    // Only delete the active user's budgets before syncing
    await db.runAsync("DELETE FROM budgets WHERE user_id = ?", [userId]);
    for (const b of budgets) await LocalDB.upsertBudget(b);
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    return db.getAllAsync<Budget>("SELECT * FROM budgets WHERE user_id = ?", [
      userId,
    ]);
  },

  upsertBudget: async (b: Partial<Budget>) => {
    await db.runAsync(
      `
      INSERT INTO budgets (
      id, user_id, category, amount,
      period_type, start_date,
      created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, period_type, category)
      DO UPDATE SET
      amount = excluded.amount,
      start_date = excluded.start_date,
      updated_at = excluded.updated_at;
    `,
      [
        b.id ?? Crypto.randomUUID(),
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

  getLatestSMSTransaction: async (userId: string) => {
    const data = await db.getFirstAsync<Transaction>(
      `
      SELECT transaction_date, source_sms_id FROM transactions
      WHERE source = 'sms' AND user_id = ? ORDER BY transaction_date DESC, source_sms_id DESC LIMIT 1
    `,
      [userId],
    );
    return data ?? null;
  },
};
