import html2canvas from "html2canvas";

export const SHARE_STORY_W = 390;
export const SHARE_STORY_H = 844;
export const SHARE_STORY_PADDING = "52px 28px 12px";
export const SHARE_CAPTURE_BG = "#1A1A1A";
export const SHARE_PNG_FILENAME = "fanstories-2025.png";
export const SHARE_SHEET_TITLE = "My 2025 Harvest";

/** Host styles while off-screen — never use low opacity (html2canvas captures it as nearly black). */
export function getShareCaptureHostStyle() {
  return {
    position: "fixed",
    left: 0,
    top: 0,
    width: SHARE_STORY_W,
    height: SHARE_STORY_H,
    boxSizing: "border-box",
    padding: SHARE_STORY_PADDING,
    background: SHARE_CAPTURE_BG,
    overflow: "hidden",
    pointerEvents: "none",
    visibility: "hidden",
    zIndex: -1,
  };
}

export function stashShareCaptureVisibility(captureEl) {
  return {
    visibility: captureEl.style.visibility,
    opacity: captureEl.style.opacity,
    pointerEvents: captureEl.style.pointerEvents,
    zIndex: captureEl.style.zIndex,
  };
}

/** Full opacity during capture so html2canvas records real colors. */
export function prepareShareCaptureElement(captureEl) {
  const stash = stashShareCaptureVisibility(captureEl);
  captureEl.style.visibility = "visible";
  captureEl.style.opacity = "1";
  captureEl.style.pointerEvents = "none";
  captureEl.style.zIndex = "-1";
  return stash;
}

export function restoreShareCaptureElement(captureEl, stash) {
  captureEl.style.visibility = stash.visibility;
  captureEl.style.opacity = stash.opacity;
  captureEl.style.pointerEvents = stash.pointerEvents;
  captureEl.style.zIndex = stash.zIndex;
}

export function getHtml2canvasShareOptions(captureEl) {
  return {
    scale: 2,
    useCORS: true,
    backgroundColor: SHARE_CAPTURE_BG,
    logging: false,
    width: captureEl.offsetWidth || SHARE_STORY_W,
    height: captureEl.offsetHeight || SHARE_STORY_H,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
  };
}

/**
 * Returns true if RGBA buffer has meaningful non-background pixels (guards all-black exports).
 */
export function pixelsHaveVisibleContent(
  data,
  width,
  height,
  backgroundRgb = [26, 26, 26],
  minDistinctRatio = 0.008
) {
  if (!data?.length || !width || !height) return false;

  let distinct = 0;
  const total = width * height;
  const [br, bg, bb] = backgroundRgb;
  const threshold = 18;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 8) continue;
    if (Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb) > threshold) {
      distinct += 1;
    }
  }

  return distinct / total >= minDistinctRatio;
}

export function captureCanvasHasVisibleContent(canvas, backgroundRgb = [26, 26, 26], minDistinctRatio = 0.008) {
  const ctx = canvas.getContext?.("2d");
  if (!ctx) return false;

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  return pixelsHaveVisibleContent(data, width, height, backgroundRgb, minDistinctRatio);
}

export async function loadShareCaptureFonts() {
  if (!document.fonts?.ready) return;
  await document.fonts.ready;
  try {
    await document.fonts.load("700 16px Inter");
    await document.fonts.load("700 13px Inter");
    await document.fonts.load('700 22px "Playfair Display"');
    await document.fonts.load('700 19px "Playfair Display"');
  } catch {
    /* fall back to system fonts */
  }
}

/** Captures the 390×844 story frame (recap + export CTA). */
export async function captureShareCardToPngBlob(captureEl, { html2canvasFn = html2canvas, settleMs = 200 } = {}) {
  if (!captureEl) {
    throw new Error("Share capture element missing");
  }

  await loadShareCaptureFonts();
  await new Promise((resolve) => setTimeout(resolve, settleMs));

  const stash = prepareShareCaptureElement(captureEl);

  try {
    const canvas = await html2canvasFn(captureEl, getHtml2canvasShareOptions(captureEl));

    if (!captureCanvasHasVisibleContent(canvas)) {
      throw new Error("Share capture produced a blank image");
    }

    return await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
    });
  } finally {
    restoreShareCaptureElement(captureEl, stash);
  }
}
