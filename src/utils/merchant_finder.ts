import { Asset } from "expo-asset";
import * as ort from "onnxruntime-react-native";

let session: ort.InferenceSession | null = null;
let vocab: Record<string, number> | null = null;

function encodeSimple(text: string, vocab: Record<string, number>) {
  const words = text.toLowerCase().trim().split(/\s+/);

  const ids = [101];

  for (const word of words) {
    ids.push(vocab[word] ?? 100);
  }

  ids.push(102);

  return {
    input_ids: ids,
    attention_mask: Array(ids.length).fill(1),
    words,
  };
}

export async function initializeMerchantExtractor() {
  if (session && vocab) {
    return;
  }

  const tokenizerJson = require("../../assets/models/tokenizer.json");

  vocab = tokenizerJson.model.vocab;

  const modelAsset = Asset.fromModule(
    require("../../assets/models/merchant_all_MiniLM_L6_v2_mobile.onnx"),
  );

  await modelAsset.downloadAsync();

  if (!modelAsset.localUri) {
    throw new Error("Failed to load model");
  }

  session = await ort.InferenceSession.create(modelAsset.localUri);
}

export async function extractMerchant(text: string): Promise<string | null> {
  if (!session || !vocab) {
    await initializeMerchantExtractor();
  }

  if (!session || !vocab) {
    throw new Error("Failed to initialize merchant extractor");
  }

  const encoded = encodeSimple(text, vocab);

  const inputIds = BigInt64Array.from(encoded.input_ids.map((x) => BigInt(x)));

  const attentionMask = BigInt64Array.from(
    encoded.attention_mask.map((x) => BigInt(x)),
  );

  const feeds = {
    input_ids: new ort.Tensor("int64", inputIds, [1, inputIds.length]),
    attention_mask: new ort.Tensor("int64", attentionMask, [
      1,
      attentionMask.length,
    ]),
  };

  const results = await session.run(feeds);

  const logits = results.logits;

  const predictions: number[] = [];

  for (let i = 0; i < logits.dims[1]; i++) {
    const base = i * 3;

    const o = Number(logits.data[base]);
    const b = Number(logits.data[base + 1]);
    const ii = Number(logits.data[base + 2]);

    const max = Math.max(o, b, ii);

    if (max === o) {
      predictions.push(0);
    } else if (max === b) {
      predictions.push(1);
    } else {
      predictions.push(2);
    }
  }

  const merchantTokens: string[] = [];

  for (let i = 1; i < predictions.length - 1; i++) {
    if (predictions[i] === 1 || predictions[i] === 2) {
      merchantTokens.push(encoded.words[i - 1]);
    }
  }

  const merchant = merchantTokens.join(" ").trim();
  return merchant || "UNK";
}

export async function disposeMerchantExtractor() {
  try {
    if (session) {
      // Depending on the onnxruntime-react-native version:
      await session.release?.();
    }
  } catch (err) {
    console.warn("Failed to release session:", err);
  }

  session = null;
  vocab = null;
}
