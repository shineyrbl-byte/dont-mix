// Read a label from a photo, entirely in the browser (Tesseract.js).
// The engine is only downloaded when someone scans, never on page load.
import { t, lang } from "./i18n.js";
import { read } from "./label.js";

const LIB = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const $input = document.getElementById("label-photo");
const $status = document.getElementById("ocr-status");
const $text = document.getElementById("label-text");

let libPromise = null;
function loadLib() {
  if (globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
  libPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = LIB;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve(globalThis.Tesseract);
    s.onerror = () => {
      libPromise = null;
      reject(new Error("load"));
    };
    document.head.append(s);
  });
  return libPromise;
}

// Shrink big phone photos first: faster, and plenty for label text.
async function shrink(file, max = 2000) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return canvas;
}

export async function scan(file) {
  $status.textContent = t("ocr.loading");
  let worker;
  try {
    const Tesseract = await loadLib();
    worker = await Tesseract.createWorker(lang === "hi" ? ["eng", "hin"] : "eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") $status.textContent = t("ocr.reading", { p: Math.round(m.progress * 100) });
      },
    });
  } catch {
    $status.textContent = t("ocr.fail");
    return "";
  }
  try {
    const image = await shrink(file);
    const { data } = await worker.recognize(image);
    const text = data.text.replace(/[ \t]+\n/g, "\n").trim();
    if (!text) {
      $status.textContent = t("ocr.none");
      return "";
    }
    $text.value = text;
    $status.textContent = t("ocr.done");
    read();
    return text;
  } catch {
    $status.textContent = t("ocr.none");
    return "";
  } finally {
    await worker.terminate();
  }
}

$input.addEventListener("change", () => {
  const file = $input.files?.[0];
  if (file) scan(file);
  $input.value = "";
});
