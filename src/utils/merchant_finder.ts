import { Asset } from "expo-asset";
import * as ort from "onnxruntime-react-native";

let session: ort.InferenceSession | null = null;
let vocab: Record<string, number> | null = null;

// ─── WordPiece tokenizer ──────────────────────────────────────────────────────

function wordpieceTokenize(
  word: string,
  vocab: Record<string, number>,
): number[] {
  // whole word hit
  if (vocab[word] !== undefined) return [vocab[word]];

  const ids: number[] = [];
  let remaining = word;
  let isFirst = true;

  while (remaining.length > 0) {
    let found = false;
    for (let end = remaining.length; end > 0; end--) {
      const candidate = isFirst
        ? remaining.slice(0, end)
        : `##${remaining.slice(0, end)}`;
      if (vocab[candidate] !== undefined) {
        ids.push(vocab[candidate]);
        remaining = remaining.slice(end);
        isFirst = false;
        found = true;
        break;
      }
    }
    if (!found) return [100]; // genuine UNK — no subword split possible
  }

  return ids;
}

function encode(text: string, vocab: Record<string, number>) {
  const words = text.toLowerCase().trim().split(/\s+/);
  const input_ids = [101]; // [CLS]
  // wordSpans[i] = { start, end } token index range for words[i]
  const wordSpans: Array<{ start: number; end: number }> = [];

  for (const word of words) {
    const subIds = wordpieceTokenize(word, vocab);
    const start = input_ids.length;
    input_ids.push(...subIds);
    wordSpans.push({ start, end: input_ids.length - 1 });
  }

  input_ids.push(102); // [SEP]

  return {
    input_ids,
    attention_mask: Array(input_ids.length).fill(1),
    words,
    wordSpans,
  };
}

// ─── Init / dispose ───────────────────────────────────────────────────────────

export async function initializeMerchantExtractor() {
  if (session && vocab) return;

  const tokenizerJson = require("../../assets/models/tokenizer.json");
  vocab = tokenizerJson.model.vocab;

  const modelAsset = Asset.fromModule(
    require("../../assets/models/model.onnx"),
  );
  await modelAsset.downloadAsync();

  if (!modelAsset.localUri) throw new Error("Failed to load model");

  session = await ort.InferenceSession.create(modelAsset.localUri);
}

export async function disposeMerchantExtractor() {
  try {
    if (session) await session.release?.();
  } catch (err) {
    console.warn("Failed to release session:", err);
  }
  session = null;
  vocab = null;
}

// ─── Extraction ───────────────────────────────────────────────────────────────

export async function extractMerchant(text: string): Promise<string> {
  if (!session || !vocab) await initializeMerchantExtractor();
  if (!session || !vocab) throw new Error("Failed to initialize");

  const encoded = encode(text, vocab);

  const inputIds = BigInt64Array.from(encoded.input_ids.map((x) => BigInt(x)));
  const attentionMask = BigInt64Array.from(
    encoded.attention_mask.map((x) => BigInt(x)),
  );

  const results = await session.run({
    input_ids: new ort.Tensor("int64", inputIds, [1, inputIds.length]),
    attention_mask: new ort.Tensor("int64", attentionMask, [
      1,
      attentionMask.length,
    ]),
  });

  const logits = results.logits;

  // ── token-level predictions ─────────────────────────────────────────────────
  const tokenPreds: number[] = [];
  for (let i = 0; i < logits.dims[1]; i++) {
    const base = i * 3;
    const o = Number(logits.data[base]);
    const b = Number(logits.data[base + 1]);
    const ii = Number(logits.data[base + 2]);
    tokenPreds.push(b > o && b > ii ? 1 : ii > o && ii > b ? 2 : 0);
  }

  // ── map to word-level: use the first subword token's prediction ─────────────
  const wordPreds = encoded.wordSpans.map(({ start }) => tokenPreds[start]);

  // ── strict BIO decoding — identical to Python ───────────────────────────────
  const merchantWords: string[] = [];
  let foundB = false;

  for (let i = 0; i < wordPreds.length; i++) {
    const pred = wordPreds[i];
    if (pred === 1) {
      // B-MERCHANT
      if (foundB) break; // second B = new entity, stop
      merchantWords.push(encoded.words[i]);
      foundB = true;
    } else if (pred === 2) {
      // I-MERCHANT
      if (foundB) merchantWords.push(encoded.words[i]);
    } else {
      // O
      if (foundB) break; // entity ended
    }
  }

  return merchantWords.join(" ").trim() || "UNK";
}
