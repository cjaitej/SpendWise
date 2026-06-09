import bankInfoJson from "@/assets/bank_info/bank_headers.json";
import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/context/FinanceContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SmsAndroid from "react-native-get-sms-android";
import companyCategoryMap from "../../constants/categoryConstants";
import {
  disposeMerchantExtractor,
  extractMerchant,
} from "../../utils/merchant_finder";

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

// Change #1: Pre-build normalized category map once at module load.
// Avoids repeated toLowerCase() on every SMS during the hot loop.
const normalizedCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(companyCategoryMap).map(([k, v]) => [k.toLowerCase(), v]),
);

type Props = {
  onClose?: () => void;
};

export default function Index({ onClose }: Props) {
  type ParsedSMS = {
    sms: SMSMessage;
    parsed: ParsedTransaction;
  };

  const [loading, setLoading] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [processedMessages, setProcessedMessages] = useState(0);
  const [phase, setPhase] = useState<"reading" | "processing" | "done">(
    "reading",
  );

  const { user } = useAuth();
  const {
    createTransactions,
    getLatestSMSTransaction,
    loadTransactions,
    loadBudget,
  } = useTransaction();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (phase !== "reading") return;

    shimmerAnim.setValue(-1);
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [phase]);

  useEffect(() => {
    if (totalMessages === 0) return;
    const target = processedMessages / totalMessages;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [processedMessages, totalMessages]);

  const handleRefresh = async (): Promise<void> => {
    await Promise.all([loadTransactions(), loadBudget()]);
  };

  async function requestSMSPermission(): Promise<boolean> {
    // Check current status before requesting
    const currentStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );

    if (currentStatus) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "SMS Permission Required",
        message:
          "We need access to your SMS to automatically detect bank transactions. We never read OTPs or any sensitive messages.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      // Android won't show dialog anymore — send user to app Settings
      Alert.alert(
        "Permission Blocked",
        "SMS permission was denied. Please enable it manually from app Settings to sync transactions.",
        [
          { text: "Cancel", style: "cancel", onPress: () => onClose?.() },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
              onClose?.();
            },
          },
        ],
      );
      return false;
    }

    // First-time denial — ask once more with context
    const grantedRetry = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "Permission Needed",
        message:
          "Without SMS access, transactions cannot be auto-detected. Please allow to continue.",
        buttonPositive: "Allow",
        buttonNegative: "Cancel",
      },
    );

    if (grantedRetry === PermissionsAndroid.RESULTS.GRANTED) return true;

    onClose?.();
    return false;
  }

  type TransactionType = "debit" | "credit";

  type ParsedTransaction = {
    type: TransactionType | null;
    amount: number | null;
    title: string | null;
    category: string | null;
  };

  function extractAmount(message: string): number | null {
    const regex = /(?:rs\.?|inr|₹)\s?:?\s?([\d,]+(?:\.\d{1,2})?)(?:\/-)?/i;
    const match = message.match(regex);
    if (!match) return null;
    const amount = Number(match[1].replace(/,/g, ""));
    if (Number.isNaN(amount)) return null;
    return amount;
  }

  // Change #4: Debit patterns listed first since they are more frequent
  // in bank SMS. No logic change — same patterns, same short-circuit behaviour.
  function extractType(message: string): TransactionType | null {
    const debitPatterns = [
      /\bdebited\b/i,
      /\bspent\b/i,
      /\bdr\b/i,
      /\bpaid\b/i,
      /\bsent\b/i,
      /\bwithdrawn\b/i,
      /\bpurchased\b/i,
      /\btransferred to\b/i,
    ];

    const creditPatterns = [
      /\bcredited\b/i,
      /\breceived\b/i,
      /\bcr\b/i,
      /\brefund\b/i,
      /\breversed\b/i,
      /\bdeposited\b/i,
      /\btransferred from\b/i,
    ];

    for (const pattern of debitPatterns) {
      if (pattern.test(message)) return "debit";
    }

    for (const pattern of creditPatterns) {
      if (pattern.test(message)) return "credit";
    }

    return null;
  }

  // Change #1 (cont.): Uses pre-built normalizedCategoryMap.
  // title is already lowercased by the time it reaches here (see smsProcessing).
  function extractCategory(title: string | null): string {
    if (!title) return "others";
    const t = title.toLowerCase().trim();
    for (const key in normalizedCategoryMap) {
      if (t.includes(key)) return normalizedCategoryMap[key];
    }
    return "others";
  }

  async function extractCounterparty(
    message: string,
    type: "debit" | "credit" | null,
  ): Promise<string | null> {
    if (!type) return null;
    return await extractMerchant(message);
  }

  // Change #3: Clean and lowercase the message string once upfront,
  // then pass the single cleaned string to all extractors.
  // extractType is called before extractAmount — both are independent
  // so order does not matter, but type is needed to gate extractCounterparty.
  async function smsProcessing(message: string): Promise<ParsedTransaction> {
    const cleanedMessage = message
      .replace(/\n|\s+/g, " ")
      .trim()
      .toLowerCase();

    const type = extractType(cleanedMessage);
    const amount = extractAmount(cleanedMessage);
    const title = await extractCounterparty(cleanedMessage, type);
    const category = extractCategory(title);

    return { amount, type, title, category };
  }

  function isOtpMessage(body: string): boolean {
    const text = body.toLowerCase();

    const keywordPatterns = [
      "otp",
      "one time password",
      "one-time password",
      "verification code",
      "authentication code",
      "auth code",
      "security code",
      "passcode",
      "access code",
      "login code",
      "sign-in code",
      "confirmation code",
      "temporary password",
      "temp password",
      "2fa",
      "two-factor",
      "two factor",
      "mpin",
    ];

    const wordBoundaryPatterns = [
      /\bpin\b/,
      /\botp\b/, // avoid matching "otpional" etc.
      /\bcode\b/, // broad but useful in SMS context
    ];

    // Standalone digit sequence (4–8 digits) often indicates OTP

    return (
      keywordPatterns.some((kw) => text.includes(kw)) ||
      wordBoundaryPatterns.some((re) => re.test(text))
    );
  }

  async function syncSMS() {
    setLoading(true);
    setPhase("reading");
    setTotalMessages(0);
    setProcessedMessages(0);
    progressAnim.setValue(0);

    try {
      const granted = await requestSMSPermission();

      if (!granted) return;
      const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
      const savedTime = await AsyncStorage.getItem(LAST_SYNCED_TIME_KEY);
      const savedSmsId = await AsyncStorage.getItem(LAST_SYNCED_SMS_ID_KEY);

      // Fetch both the date and the SMS ID from the DB if local storage is empty
      const latestTransaction = !savedTime
        ? await getLatestSMSTransaction()
        : null;

      const lastSyncedTime = savedTime
        ? Number(savedTime)
        : latestTransaction?.transaction_date
          ? new Date(latestTransaction.transaction_date).getTime()
          : sixMonthsAgo;

      const lastProcessedSmsId = savedSmsId
        ? Number(savedSmsId)
        : latestTransaction?.source_sms_id || null;

      SmsAndroid.list(
        JSON.stringify({
          box: "inbox",
          minDate: lastSyncedTime,
        }),

        (_fail: string) => {
          setLoading(false);
        },

        async (_count: number, smsList: string) => {
          try {
            const parsed: SMSMessage[] = JSON.parse(smsList);
            parsed.sort((a, b) => b.date - a.date);

            // const validBankIds = new Set(Object.keys(bankInfo));
            const validBankIds = new Set(
              Object.keys(bankInfo).map((key) => key.toLowerCase()),
            );
            const filtered: SMSMessage[] = [];

            for (const sms of parsed) {
              if (
                lastProcessedSmsId !== null &&
                sms._id === lastProcessedSmsId
              ) {
                break;
              }

              const address = sms.address;
              if (!address) continue;

              const isTransactional =
                address.endsWith("-T") || address.endsWith("-S");

              if (!isTransactional) continue;

              const firstDash = address.indexOf("-");
              const lastDash = address.lastIndexOf("-");

              if (firstDash === -1 || lastDash === -1) continue;

              const bankId = address.slice(firstDash + 1, lastDash);

              if (!validBankIds.has(bankId.toLowerCase())) continue;

              if (isOtpMessage(sms.body)) {
                continue;
              }

              filtered.push(sms);
            }

            if (filtered.length === 0) {
              setPhase("done");
              return;
            }

            setTotalMessages(filtered.length);
            setPhase("processing");

            const parsedTransactions: ParsedSMS[] = [];

            try {
              for (let i = 0; i < filtered.length; i++) {
                const sms = filtered[i];

                const parsedResult = await smsProcessing(sms.body);

                parsedTransactions.push({
                  sms,
                  parsed: parsedResult,
                });

                // Change #5: Functional setState update to avoid stale
                // closure bugs. Equivalent to (i + 1) in sequential code
                // but correct by construction.
                setProcessedMessages((prev) => prev + 1);
              }
            } finally {
              await disposeMerchantExtractor();
            }

            setPhase("done");

            const transactions = parsedTransactions
              .filter(
                ({ parsed }) => parsed.amount !== null && parsed.type !== null,
              )
              .map(({ sms, parsed }) => ({
                user_id: user?.id,
                amount: parsed.amount!,
                transaction_type: parsed.type!,
                category: parsed.category,
                merchant_name: parsed.title === "UNK" ? null : parsed.title,
                transaction_date: new Date(sms.date).toISOString(),
                source: "sms" as const,
                is_auto_detected: true,
                source_sms_id: sms._id,
              }));

            if (transactions.length > 0) {
              await createTransactions(transactions);
            }

            const newestSms = filtered[0];

            await AsyncStorage.multiSet([
              [LAST_SYNCED_TIME_KEY, newestSms.date.toString()],
              [LAST_SYNCED_SMS_ID_KEY, newestSms._id.toString()],
            ]);
          } catch (err) {
            console.error("SMS sync failed:", err);
          } finally {
            setLoading(false);
          }
        },
      );
    } catch (err) {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncSMS();
  }, []);

  const progressPercent =
    totalMessages > 0
      ? Math.round((processedMessages / totalMessages) * 100)
      : 0;

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-200, 200],
  });

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal visible={true} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-white/50 ">
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="border border-border bg-card px-6 py-6 rounded-2xl w-72 gap-5"
        >
          <View className="items-center gap-2">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-1">
              <Text style={{ fontSize: 22 }}>
                {phase === "reading"
                  ? "📩"
                  : phase === "processing"
                    ? "⚙️"
                    : "✅"}
              </Text>
            </View>
            <Text className="text-foreground text-base font-semibold tracking-tight">
              {phase === "reading"
                ? "Reading Messages"
                : phase === "processing"
                  ? "Processing Transactions"
                  : "All Done"}
            </Text>
            <Text className="text-muted-foreground text-xs text-center">
              {phase === "reading"
                ? "Scanning your inbox for bank messages…"
                : phase === "processing"
                  ? `Analysing ${totalMessages} transaction${totalMessages !== 1 ? "s" : ""}…`
                  : `Processed ${totalMessages} transaction${totalMessages !== 1 ? "s" : ""} successfully`}
            </Text>
          </View>

          <View className="gap-2">
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              {phase === "reading" ? (
                <Animated.View
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                  }}
                  className="bg-muted"
                >
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: 80,
                      borderRadius: 999,
                      transform: [{ translateX: shimmerTranslate }],
                    }}
                    className="bg-primary opacity-60"
                  />
                </Animated.View>
              ) : phase === "processing" ? (
                <Animated.View
                  style={{ width: animatedWidth }}
                  className="h-full bg-primary rounded-full"
                />
              ) : (
                <View className="h-full w-full bg-primary rounded-full" />
              )}
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-xs">
                {phase === "reading"
                  ? "Fetching…"
                  : phase === "done"
                    ? "Complete"
                    : `${processedMessages} of ${totalMessages}`}
              </Text>
              <Text className="text-muted-foreground text-xs font-medium">
                {phase === "processing"
                  ? `${progressPercent}%`
                  : phase === "done"
                    ? "100%"
                    : ""}
              </Text>
            </View>
          </View>

          {phase === "done" && (
            <TouchableOpacity
              onPress={async () => {
                onClose?.();
                await handleRefresh(); // Triggers your data reload logic
              }}
              className="bg-primary rounded-xl py-3 px-4 self-center"
            >
              <Text className="text-content-white text-sm font-semibold">
                Done
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
