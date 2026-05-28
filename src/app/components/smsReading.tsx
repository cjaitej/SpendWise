import bankInfoJson from "@/assets/bank_info/bank_headers.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import companyCategoryMap from "../../constants/categoryConstants";

import SmsAndroid from "react-native-get-sms-android";

type SMSMessage = {
  _id: number;
  address: string;
  body: string;
  contains_otp: number;
  date: number;
  read: number;
  thread_id: number;
  type: number;
};

type BankInfo = Record<string, string>;

const bankInfo: BankInfo = bankInfoJson;

const LAST_SYNCED_TIME_KEY = "last_synced_time";
const LAST_SYNCED_SMS_ID_KEY = "last_synced_sms_id";

export default function Index() {
  type ParsedSMS = {
    sms: SMSMessage;
    parsed: ParsedTransaction;
  };

  const [messages, setMessages] = useState<ParsedSMS[]>([]);

  async function requestSMSPermission(): Promise<boolean> {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  type TransactionType = "debit" | "credit";

  type ParsedTransaction = {
    type: TransactionType | null;
    amount: number | null;
    title: string | null;
    category: string | null;
  };

  const debitKeywords = [
    "to",
    "at",
    "towards",
    "via",
    "for",
    "using",
    "on",
    "merchant",
    "beneficiary",
    "paidto",
    "sentto",
    "transferto",
  ];

  const creditKeywords = [
    "from",
    "by",
    "via",
    "through",
    "sender",
    "remitter",
    "depositor",
    "creditedby",
    "receivedfrom",
  ];

  function extractAmount(message: string): number | null {
    const regex = /(?:rs\.?|inr|₹)\s?:?\s?([\d,]+(?:\.\d{1,2})?)(?:\/-)?/i;

    const match = message.match(regex);

    if (!match) {
      return null;
    }

    const amount = Number(match[1].replace(/,/g, ""));

    if (Number.isNaN(amount)) {
      return null;
    }

    return amount;
  }

  function extractType(message: string): TransactionType | null {
    const text = message.toLowerCase();

    const debitPatterns = [
      /\bdebited\b/i,
      /\bspent\b/i,
      /\bwithdrawn\b/i,
      /\bpaid\b/i,
      /\bsent\b/i,
      /\bpurchased\b/i,
      /\btransferred to\b/i,
      /\bdr\b/i,
    ];

    const creditPatterns = [
      /\bcredited\b/i,
      /\breceived\b/i,
      /\bdeposited\b/i,
      /\brefund\b/i,
      /\breversed\b/i,
      /\btransferred from\b/i,
      /\bcr\b/i,
    ];

    for (const pattern of debitPatterns) {
      if (pattern.test(text)) {
        return "debit";
      }
    }

    for (const pattern of creditPatterns) {
      if (pattern.test(text)) {
        return "credit";
      }
    }

    return null;
  }

  function extractCategory(message: string): string {
    const cleanedMessage = message
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    // Check all companies/keywords
    for (const company in companyCategoryMap) {
      // If keyword found in SMS
      if (cleanedMessage.includes(company)) {
        return companyCategoryMap[company];
      }
    }

    // Default fallback
    return "others";
  }

  function extractCounterparty(
    message: string,
    type: "debit" | "credit" | null,
  ): string | null {
    if (!type) {
      return null;
    }

    const keywords = type === "debit" ? debitKeywords : creditKeywords;

    const words = message.split(" ");

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];

      if (keywords.includes(currentWord)) {
        const nextWord = words[i + 1];

        if (!nextWord) {
          return null;
        }

        return nextWord.replace(/[.,:]/g, "").trim();
      }
    }

    return null;
  }

  function smsProcessing(message: string): ParsedTransaction {
    const cleanedMessage = message
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const amount = extractAmount(cleanedMessage);
    const type = extractType(cleanedMessage);
    const title = extractCounterparty(cleanedMessage, type);
    const category = extractCategory(cleanedMessage);

    return {
      amount: amount,

      type: type,

      title: title,

      category: category,
    };
  }

  async function syncSMS() {
    const granted = await requestSMSPermission();

    if (!granted) {
      console.log("Permission denied");
      return;
    }

    const savedTime = await AsyncStorage.getItem(LAST_SYNCED_TIME_KEY);

    const savedSmsId = await AsyncStorage.getItem(LAST_SYNCED_SMS_ID_KEY);

    const lastSyncedTime = savedTime ? Number(savedTime) : 0;

    const lastProcessedSmsId = savedSmsId ? Number(savedSmsId) : null;

    SmsAndroid.list(
      JSON.stringify({
        box: "inbox",
        minDate: lastSyncedTime,
      }),

      (fail: string) => {
        console.log("Failed:", fail);
      },

      async (_count: number, smsList: string) => {
        const parsed: SMSMessage[] = JSON.parse(smsList);
        parsed.sort((a, b) => b.date - a.date);
        const validBankIds = new Set(Object.keys(bankInfo));

        const filtered: SMSMessage[] = [];

        for (const sms of parsed) {
          // Stop immediately once we hit
          // already processed SMS
          if (lastProcessedSmsId !== null && sms._id === lastProcessedSmsId) {
            break;
          }

          const address = sms.address;

          if (!address) continue;

          const isTransactional =
            address.endsWith("-T") || address.endsWith("-S");

          if (!isTransactional) continue;

          const firstDash = address.indexOf("-");
          const lastDash = address.lastIndexOf("-");

          if (firstDash === -1 || lastDash === -1) {
            continue;
          }

          const bankId = address.slice(firstDash + 1, lastDash);

          if (!validBankIds.has(bankId)) {
            continue;
          }

          // Ignore OTP messages
          if (sms.contains_otp !== 0) {
            continue;
          }

          filtered.push(sms);
        }

        // Save newest processed SMS cursor
        if (filtered.length > 0) {
          const newestSms = filtered[0];

          await AsyncStorage.setItem(
            LAST_SYNCED_TIME_KEY,
            newestSms.date.toString(),
          );

          await AsyncStorage.setItem(
            LAST_SYNCED_SMS_ID_KEY,
            newestSms._id.toString(),
          );
        }

        const parsedTransactions: ParsedSMS[] = filtered.map((sms) => ({
          sms,
          parsed: smsProcessing(sms.body),
        }));

        setMessages(parsedTransactions);
      },
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={syncSMS} style={styles.button}>
        <Text style={styles.buttonText}>Sync SMS</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(({ sms, parsed }) => (
          <View key={sms._id} style={styles.messageCard}>
            <Text style={styles.sender}>{sms.address}</Text>

            <Text style={styles.id}>ID: {sms._id}</Text>

            <Text style={styles.body}>{sms.body}</Text>

            <Text style={styles.date}>
              {new Date(sms.date).toLocaleString()}
            </Text>

            <View style={{ marginTop: 10 }}>
              <Text>Type: {parsed.type ?? "N/A"}</Text>

              <Text>Amount: {parsed.amount ?? "N/A"}</Text>

              <Text>Title: {parsed.title ?? "N/A"}</Text>

              <Text>Category: {parsed.category ?? "N/A"}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  scrollView: {
    marginTop: 24,
  },

  messageCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 16,
  },

  sender: {
    fontSize: 16,
    fontWeight: "700",
  },

  id: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },

  body: {
    marginTop: 6,
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
  },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
});
