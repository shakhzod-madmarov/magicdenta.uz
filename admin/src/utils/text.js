export const normalizeText = (input = "") => {
  if (!input) return "";

  let s = String(input || "").toLowerCase().trim();

  s = s.normalize("NFKC");

  s = s.replace(/[`´‘’ʼʻʽʾʿˈꞌ']/g, "'");

  s = s
    .replace(/o'/g, "o")
    .replace(/g'/g, "g")
    .replace(/oʻ/g, "o")
    .replace(/gʻ/g, "g")
    .replace(/o‘/g, "o")
    .replace(/g‘/g, "g")
    .replace(/dzh/g, "j")
    .replace(/dj/g, "j")
    .replace(/kh/g, "x")
    .replace(/q/g, "k");

  s = s.replace(/дж/g, "j");

  const map = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "j",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "x",
    ц: "s",
    ч: "ch",
    ш: "sh",
    щ: "sh",
    ъ: "",
    ы: "i",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    қ: "k",
    ғ: "g",
    ў: "o",
    ҳ: "h",
    ң: "ng",
    ӣ: "i",
    ӯ: "u",
  };

  let out = "";

  for (const ch of s) {
    if (map[ch] !== undefined) {
      out += map[ch];
      continue;
    }

    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      continue;
    }

    if (/\s/.test(ch)) {
      out += " ";
      continue;
    }
  }

  return out.replace(/\s+/g, " ").trim();
};

const addNormalized = (bucket, value = "") => {
  const normalized = normalizeText(value);
  if (normalized) bucket.add(normalized);
};

export const buildLooseTextForms = (input = "") => {
  const forms = new Set();
  const base = normalizeText(input);

  if (!base) return forms;

  addNormalized(forms, base);

  // Users often type Cyrillic "х" where Uzbek "ҳ" or Latin "h" was intended.
  // Keep the canonical normalized value, but generate tolerant comparison forms.
  if (base.includes("x")) {
    addNormalized(forms, base.replace(/x/g, "h"));
  }

  if (base.includes("h")) {
    addNormalized(forms, base.replace(/h/g, "x"));
  }

  return forms;
};

export const fmtMoney = (val) => {
  const n = Number(val || 0);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
