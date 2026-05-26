export default function getIconBg(title: string) {
  const alphabetColors: Record<string, string> = {
    A: "#F97316",
    B: "#3B82F6",
    C: "#F59E0B",
    D: "#8B5CF6",
    E: "#EF4444",
    F: "#00A878",
    G: "#7C3AED",

    H: "#0EA5E9",
    I: "#14B8A6",
    J: "#EC4899",
    K: "#6366F1",
    L: "#22C55E",
    M: "#EAB308",
    N: "#F43F5E",

    O: "#10B981",
    P: "#8B5CF6",
    Q: "#06B6D4",
    R: "#84CC16",
    S: "#EF4444",
    T: "#00A878",
    U: "#F97316",

    V: "#3B82F6",
    W: "#A855F7",
    X: "#E11D48",
    Y: "#14B8A6",
    Z: "#F59E0B",
  };

  const firstLetter = title.charAt(0).toUpperCase();

  return alphabetColors[firstLetter] || "#00A878";
}
