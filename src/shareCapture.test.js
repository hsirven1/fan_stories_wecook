import {
  SHARE_STORY_W,
  SHARE_STORY_H,
  SHARE_CAPTURE_BG,
  captureShareCardToPngBlob,
  getHtml2canvasShareOptions,
  getShareCaptureHostStyle,
  pixelsHaveVisibleContent,
  prepareShareCaptureElement,
  restoreShareCaptureElement,
  stashShareCaptureVisibility,
} from "./shareCapture";

describe("getShareCaptureHostStyle", () => {
  it("hides the host without reducing opacity (opacity breaks html2canvas)", () => {
    const style = getShareCaptureHostStyle();
    expect(style.visibility).toBe("hidden");
    expect(style.opacity).toBeUndefined();
    expect(style.width).toBe(SHARE_STORY_W);
    expect(style.height).toBe(SHARE_STORY_H);
    expect(style.background).toBe(SHARE_CAPTURE_BG);
  });
});

describe("prepareShareCaptureElement", () => {
  it("sets full opacity and visible before capture", () => {
    const el = document.createElement("div");
    Object.assign(el.style, getShareCaptureHostStyle());

    const stash = prepareShareCaptureElement(el);
    expect(el.style.visibility).toBe("visible");
    expect(el.style.opacity).toBe("1");

    restoreShareCaptureElement(el, stash);
    expect(el.style.visibility).toBe("hidden");
  });

  it("restores prior inline styles after capture", () => {
    const el = document.createElement("div");
    el.style.visibility = "hidden";
    el.style.opacity = "";
    el.style.zIndex = "-1";

    const stash = stashShareCaptureVisibility(el);
    prepareShareCaptureElement(el);
    restoreShareCaptureElement(el, stash);

    expect(el.style.visibility).toBe("hidden");
  });
});

describe("pixelsHaveVisibleContent", () => {
  function fillBackgroundBuffer(width, height) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 26;
      data[i + 1] = 26;
      data[i + 2] = 26;
      data[i + 3] = 255;
    }
    return data;
  }

  it("detects a solid background buffer as blank", () => {
    const data = fillBackgroundBuffer(100, 100);
    expect(pixelsHaveVisibleContent(data, 100, 100)).toBe(false);
  });

  it("passes when non-background pixels exist", () => {
    const data = fillBackgroundBuffer(100, 100);
    for (let x = 0; x < 100; x += 1) {
      const i = (80 * 100 + x) * 4;
      data[i] = 196;
      data[i + 1] = 98;
      data[i + 2] = 45;
    }
    expect(pixelsHaveVisibleContent(data, 100, 100)).toBe(true);
  });
});

function mockCanvasWithPixels(data, width, height) {
  return {
    width,
    height,
    getContext: () => ({
      getImageData: () => ({ data, width, height }),
    }),
    toBlob: (cb) => cb(new Blob([new Uint8Array([137, 80, 78])], { type: "image/png" })),
  };
}

describe("captureShareCardToPngBlob", () => {
  it("captures at full opacity and rejects blank output", async () => {
    const host = document.createElement("div");
    Object.assign(host.style, getShareCaptureHostStyle());
    host.style.width = `${SHARE_STORY_W}px`;
    host.style.height = `${SHARE_STORY_H}px`;
    host.innerHTML = "<div>Your 2025 Harvest</div>";
    document.body.appendChild(host);

    const visible = fillBackgroundOnly(SHARE_STORY_W, SHARE_STORY_H);
    for (let y = SHARE_STORY_H - 80; y < SHARE_STORY_H; y += 1) {
      for (let x = 0; x < SHARE_STORY_W; x += 1) {
        const i = (y * SHARE_STORY_W + x) * 4;
        visible[i] = 196;
        visible[i + 1] = 98;
        visible[i + 2] = 45;
      }
    }

    const html2canvasFn = jest.fn(async (el) => {
      expect(el.style.opacity).toBe("1");
      expect(el.style.visibility).toBe("visible");
      expect(getHtml2canvasShareOptions(el).backgroundColor).toBe(SHARE_CAPTURE_BG);
      return mockCanvasWithPixels(visible, SHARE_STORY_W, SHARE_STORY_H);
    });

    const blob = await captureShareCardToPngBlob(host, { html2canvasFn, settleMs: 0 });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
    expect(host.style.visibility).toBe("hidden");
    expect(html2canvasFn).toHaveBeenCalledTimes(1);

    document.body.removeChild(host);
  });

  it("throws when html2canvas returns a blank canvas", async () => {
    const host = document.createElement("div");
    Object.assign(host.style, getShareCaptureHostStyle());
    document.body.appendChild(host);

    const blank = fillBackgroundOnly(SHARE_STORY_W, SHARE_STORY_H);
    const html2canvasFn = jest.fn(async () => mockCanvasWithPixels(blank, SHARE_STORY_W, SHARE_STORY_H));

    await expect(captureShareCardToPngBlob(host, { html2canvasFn, settleMs: 0 })).rejects.toThrow(
      /blank image/i
    );

    document.body.removeChild(host);
  });
});

function fillBackgroundOnly(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 26;
    data[i + 1] = 26;
    data[i + 2] = 26;
    data[i + 3] = 255;
  }
  return data;
}
