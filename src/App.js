import { useState, useRef, useId } from "react";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";

const WRAPPED_DATA = {
  meals: 87,
  recipes: 34,
  favorite_meal: "Butter Chicken",
  cooking_style: "gastronaut",
  co2_saved: 218,
  /** Time slide — prep vs scratch shopping (demo) */
  avg_prep_mins_per_meal: 25,
  meals_per_grocery_shop: 3,
  mins_planning_shopping_per_trip: 90,
  /** Favorite meal slide — supporting stats (demo) */
  favorite_meal_times_cooked: 12,
  favorite_meal_estimated_mins: 35,
};

const TAKEOUT_KG_PER_MEAL = 2.5;

const FAVORITE_MEAL_HERO_IMAGE = "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800";
const PALETTE = {
  cream: "#F5F0E8",
  terracotta: "#C4622D",
  forest: "#2D4A3E",
  ink: "#1A1A1A",
};

/** Progress segments follow the *current* slide background for contrast. */
const PROGRESS_BAR = {
  dark: { filled: "#ffffff", unfilled: "rgba(255,255,255,0.25)" },
  light: { filled: PALETTE.ink, unfilled: "rgba(0,0,0,0.15)" },
};

const PROFILE_CONTENT = {
  gastronaut: {
    title: "THE GASTRONAUT",
    body:
      "You treat your kitchen like a tasting menu—technique-forward, flavor-obsessed, and never boring. This year you plated ambition on every night you cooked.",
    shareSummary:
      "Technique-forward and flavor-obsessed—you plated ambition on every night you cooked, tasting-menu style.",
  },
  healthy_hustler: {
    title: "THE HEALTHY HUSTLER",
    body:
      "Nutrition meets momentum: you balanced macros between meetings and still found time to chop, steam, and season like it matters—because it does.",
    shareSummary:
      "You balanced macros between meetings and still seasoned every meal like it matters—because it does.",
  },
  world_explorer: {
    title: "THE WORLD EXPLORER",
    body:
      "Your stove became a passport. New cuisines, new spices, new stories—each recipe another stamp in your edible itinerary.",
    shareSummary:
      "New cuisines and spices—each recipe another stamp in your edible itinerary.",
  },
  comfort_seeker: {
    title: "THE COMFORT SEEKER",
    body:
      "You chased warmth in bowls and bubbling pans. Familiar flavors, gentle rituals, and meals that feel like coming home—every single time.",
    shareSummary:
      "Familiar flavors and gentle rituals—meals that feel like coming home, every single time.",
  },
  speed_chef: {
    title: "THE SPEED CHEF",
    body:
      "Thirty minutes or less, zero apologies. You optimized flavor per minute and proved fast food can still be real food.",
    shareSummary:
      "Thirty minutes or less—you optimized flavor per minute and proved fast food can still be real food.",
  },
};

const profileFromData = (data) =>
  PROFILE_CONTENT[data.cooking_style] || PROFILE_CONTENT.gastronaut;

/** Full-bleed share card interior (Grain + gradients + column) — laid out for 9:16 story capture. */
const ShareCardScene = ({ data, profile, shoppingTimeSavedHours, showExportCta }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
    }}
  >
    <Grain opacity={0.06} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 20% 90%, rgba(196,98,45,0.15) 0%, transparent 50%)`,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 85% 10%, rgba(45,74,62,0.35) 0%, transparent 55%)`,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "relative",
        zIndex: 5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 6,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
        <FreshPlateLogo color="rgba(245,240,232,0.95)" size={1.15} hideSubtitle />
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "rgba(245,240,232,0.45)", lineHeight: 1.1 }}>Your 2025 Harvest</div>
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(245,240,232,0.2), transparent)" }} />
      </div>

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          gap: 6,
        }}
      >
        <div style={{ background: "rgba(245,240,232,0.07)", borderRadius: 12, padding: "9px 12px 10px", border: "1px solid rgba(245,240,232,0.1)", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>Persona</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 19, color: "#F5F0E8", lineHeight: 1.15 }}>{profile.title}</div>
          <p
            style={{
              margin: 0,
              marginTop: 5,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(245,240,232,0.5)",
              lineHeight: 1.4,
            }}
          >
            {profile.shareSummary ?? profile.body}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
          {[
            { val: data.meals, lbl: "meals cooked", accent: PALETTE.terracotta },
            { val: data.recipes, lbl: "recipes learned", accent: PALETTE.cream },
            { val: `${shoppingTimeSavedHours}hrs`, lbl: "saved on shopping", accent: PALETTE.terracotta },
            { val: `${data.co2_saved} kg`, lbl: "CO₂ saved", accent: "#8FB5A3" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(245,240,232,0.06)",
                padding: "9px 10px",
                borderRadius: 10,
                border: "1px solid rgba(245,240,232,0.08)",
              }}
            >
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: s.accent, lineHeight: 1, letterSpacing: -0.3 }}>{s.val}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: 1.4, marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        <div
          role="img"
          aria-label={`${data.favorite_meal} dish`}
          style={{
            position: "relative",
            width: "100%",
            flex: "1 1 auto",
            minHeight: 96,
            maxHeight: 120,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            backgroundColor: "#141414",
            backgroundImage: `url("${FAVORITE_MEAL_HERO_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(26,26,26,0.12) 0%, rgba(26,26,26,0.2) 45%, rgba(10,10,10,0.55) 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "8px 12px 9px",
              background: "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.92) 28%, rgba(10,10,10,0.97) 100%)",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 8, color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 2 }}>
              Favorite meal
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#F5F0E8", lineHeight: 1.15, letterSpacing: -0.2 }}>{data.favorite_meal}</div>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.28)", letterSpacing: 1.2 }}>#FreshPlate2025</span>
        </div>
        <div
          style={{
            opacity: showExportCta ? 1 : 0,
            visibility: showExportCta ? "visible" : "hidden",
            flexShrink: 0,
            minHeight: showExportCta ? 54 : 0,
            background: "#C4622D",
            borderRadius: 8,
            padding: "12px 14px",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#ffffff",
              lineHeight: 1.25,
            }}
          >
            Get 15% off FreshPlate
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "#ffffff",
              lineHeight: 1.35,
              marginTop: 4,
            }}
          >
            Use code 2025HARVEST at checkout
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FRESHPLATE_SHARE_URL = "https://freshplate.com/wrapped/2025";

const downloadPngBlob = (blob, filename = "fanstories-2025.png") => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** Instagram Story capture frame (9:16, iPhone logical size). */
const SHARE_STORY_W = 390;
const SHARE_STORY_H = 844;
const SHARE_STORY_PADDING = "48px 32px 32px 32px";

/**
 * Captures the fixed 390×844 story frame. Toggles export CTA via React state, then html2canvas at scale 2.
 */
async function captureShareCardToPngBlob(captureEl, setShowExportCta) {
  await document.fonts.ready;
  try {
    await document.fonts.load('700 16px Inter');
    await document.fonts.load('500 13px Inter');
  } catch {
    /* fall back to system fonts */
  }

  flushSync(() => setShowExportCta(true));

  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const canvas = await html2canvas(captureEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: PALETTE.ink,
      logging: false,
      width: SHARE_STORY_W,
      height: SHARE_STORY_H,
    });
    return await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png");
    });
  } finally {
    flushSync(() => setShowExportCta(false));
  }
}

const Grain = ({ opacity = 0.04 }) => {
  const filterId = `grain-${useId().replace(/:/g, "")}`;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none", mixBlendMode: "overlay", zIndex: 10 }}>
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
};

const WaveBg = ({ color, opacity = 0.14 }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice">
    <ellipse cx="300" cy="100" rx="200" ry="160" fill={color} opacity={opacity} />
    <ellipse cx="80" cy="560" rx="170" ry="130" fill={color} opacity={opacity * 0.75} />
    <ellipse cx="220" cy="360" rx="140" ry="100" fill={color} opacity={opacity * 0.45} />
  </svg>
);

const FreshPlateLogo = ({ color = PALETTE.ink, size = 1, hideSubtitle = false }) => {
  const s = size;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * s }}>
      <svg width={36 * s} height={36 * s} viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="2.2" />
        <circle cx="20" cy="20" r="11" stroke={color} strokeWidth="1.4" opacity={0.45} />
        <path d="M12 20h16" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={0.35} />
      </svg>
      <div style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: 19 * s,
            color,
            letterSpacing: 0.2,
            display: "block",
          }}
        >
          FreshPlate
        </span>
        {!hideSubtitle && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 9 * s,
              color,
              opacity: 0.5,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              display: "block",
              marginTop: 3,
            }}
          >
            Your 2025 Harvest
          </span>
        )}
      </div>
    </div>
  );
};

const slides = (data, showExportCta) => {
  const profile = profileFromData(data);
  const takeoutIfOrdered = data.meals * TAKEOUT_KG_PER_MEAL;
  const mealsPerWeek = (data.meals / 52).toFixed(1);
  const totalKitchenHours = Math.round((data.meals * data.avg_prep_mins_per_meal) / 60);
  const groceryTripsAvoided = Math.round(data.meals / data.meals_per_grocery_shop);
  const shoppingTimeSavedHours = Math.round((groceryTripsAvoided * data.mins_planning_shopping_per_trip) / 60);

  return [
    {
      bg: PALETTE.cream,
      textColor: PALETTE.ink,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <WaveBg color={PALETTE.terracotta} opacity={0.12} />
          <Grain opacity={0.05} />
          <div style={{ position: "absolute", right: -40, top: "42%", transform: "translateY(-50%)", opacity: 0.08, zIndex: 2, pointerEvents: "none" }}>
            <svg width="220" height="220" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="17" stroke={PALETTE.terracotta} strokeWidth="1.5" />
              <circle cx="20" cy="20" r="11" stroke={PALETTE.terracotta} strokeWidth="1" opacity={0.5} />
            </svg>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ height: 48 }} />
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(26,26,26,0.45)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 20 }}>
                FreshPlate
              </p>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 52,
                  color: PALETTE.ink,
                  lineHeight: 1.05,
                  letterSpacing: -0.5,
                  marginBottom: 16,
                }}
              >
                Your year in
                <br />
                the kitchen.
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(26,26,26,0.55)", lineHeight: 1.65, maxWidth: 280 }}>
                A warm look back at what you cooked, learned, and savored with your meal kits.
              </p>
            </div>
            <div style={{ height: 8 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.terracotta,
      textColor: "#fff",
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <Grain opacity={0.06} />
          <div style={{ position: "absolute", right: -28, top: "50%", transform: "translateY(-46%)", zIndex: 2, pointerEvents: "none", lineHeight: 0.78 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 260, color: "rgba(0,0,0,0.1)", letterSpacing: -8, display: "block" }}>{data.meals}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 2.2, marginTop: 48 }}>This year you cooked</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 132, color: "#fff", lineHeight: 0.82, letterSpacing: -4, marginBottom: 12 }}>{data.meals}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,0.95)", lineHeight: 1.05, marginBottom: 28 }}>meals.</div>
              <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 12, padding: "14px 18px", display: "inline-block", maxWidth: "100%" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
                  Roughly {mealsPerWeek} home-cooked meals per week—your table stayed busy.
                </span>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.forest,
      textColor: "#fff",
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <Grain opacity={0.05} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "36%", height: 1, background: `linear-gradient(90deg, transparent, ${PALETTE.terracotta}, transparent)`, zIndex: 2, opacity: 0.55 }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, marginTop: 48 }}>What you learned</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: 128,
                    color: PALETTE.cream,
                    lineHeight: 1,
                    letterSpacing: -3,
                    display: "block",
                    paddingBottom: 6,
                  }}
                >
                  {data.recipes}
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                    fontSize: 28,
                    color: "#fff",
                    lineHeight: 1.2,
                    letterSpacing: -0.3,
                    marginTop: 4,
                  }}
                >
                  new recipes learned
                </span>
              </div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 26, color: "#fff", lineHeight: 1.35, marginBottom: 8 }}>
              New techniques, new flavors—your repertoire grew with every box.
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.forest,
      textColor: PALETTE.cream,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <Grain opacity={0.05} />
          <div style={{ position: "absolute", right: -24, top: "22%", opacity: 0.07, zIndex: 2, pointerEvents: "none" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 200, color: PALETTE.cream, letterSpacing: -6, lineHeight: 1 }}>{totalKitchenHours}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Your time well spent</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 100, color: PALETTE.cream, lineHeight: 0.9, letterSpacing: -3, marginBottom: 6 }}>{totalKitchenHours}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 26, color: "rgba(245,240,232,0.95)", lineHeight: 1.2, marginBottom: 18 }}>hours of home cooking</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(245,240,232,0.12)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.45)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Grocery trips avoided</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: PALETTE.cream, lineHeight: 1.1 }}>{groceryTripsAvoided}</div>
                </div>
                <div style={{ background: "rgba(245,240,232,0.08)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(245,240,232,0.12)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.45)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Hours saved on shopping</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: PALETTE.cream, lineHeight: 1.1 }}>{shoppingTimeSavedHours}</div>
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.cream,
      textColor: PALETTE.ink,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <WaveBg color={PALETTE.forest} opacity={0.08} />
          <Grain opacity={0.04} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(26,26,26,0.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48, flexShrink: 0 }}>Your favorite dish</div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, paddingBottom: 4 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 36, color: PALETTE.ink, lineHeight: 1.12, marginBottom: 14, marginTop: 10 }}>{data.favorite_meal}</div>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "40%",
                  minHeight: 200,
                  maxHeight: 252,
                  flexShrink: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 14,
                  boxShadow: "0 8px 28px rgba(26,26,26,0.12)",
                }}
              >
                <img
                  src={FAVORITE_MEAL_HERO_IMAGE}
                  alt={`${data.favorite_meal} dish`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(26,26,26,0.12) 0%, rgba(26,26,26,0.35) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(26,26,26,0.55)", lineHeight: 1.6, marginBottom: 12, flexShrink: 0 }}>
                The combination you returned to most—aromatic, generous, and unmistakably yours.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0, marginTop: "auto" }}>
                <div style={{ background: "rgba(196,98,45,0.1)", borderRadius: 14, padding: "16px 16px", border: `1px solid rgba(196,98,45,0.2)` }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>Times cooked this year</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: PALETTE.terracotta, fontWeight: 700, lineHeight: 1.2 }}>{data.favorite_meal_times_cooked}</div>
                </div>
                <div style={{ background: "rgba(45,74,62,0.08)", borderRadius: 14, padding: "16px 16px", border: `1px solid rgba(45,74,62,0.15)` }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(26,26,26,0.45)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6 }}>Est. cook time</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: PALETTE.forest, fontWeight: 700, lineHeight: 1.2 }}>{data.favorite_meal_estimated_mins} mins</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.forest,
      textColor: "#fff",
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <Grain opacity={0.05} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Planet & plate</div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 72, color: PALETTE.cream, lineHeight: 1 }}>{data.co2_saved}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: "rgba(245,240,232,0.75)" }}>kg CO₂ saved</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, marginBottom: 24 }}>
                Compared to takeout, where we estimate about {TAKEOUT_KG_PER_MEAL} kg CO₂ per meal, your home cooking avoided roughly{" "}
                <strong style={{ color: "#F5F0E8", fontWeight: 600 }}>{takeoutIfOrdered.toFixed(1)} kg</strong> in delivery-forward emissions across your {data.meals} meals.
              </p>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(245,240,232,0.12)" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>
                  Same appetite, lighter footprint—every kit was a vote for fewer cars idling at the curb.
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.cream,
      textColor: PALETTE.ink,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <Grain opacity={0.04} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(180deg, transparent, rgba(196,98,45,0.06))`, zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(26,26,26,0.4)", textTransform: "uppercase", letterSpacing: 2, marginTop: 48 }}>Your kitchen persona</div>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: profile.title.length > 18 ? 36 : 44,
                  color: PALETTE.ink,
                  lineHeight: 1.05,
                  letterSpacing: -0.3,
                  marginBottom: 22,
                }}
              >
                {profile.title.split(" ").map((w, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {w}
                  </span>
                ))}
              </div>
              <div style={{ background: PALETTE.forest, borderRadius: 16, padding: "22px 22px" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#F5F0E8", lineHeight: 1.75, fontWeight: 400 }}>{profile.body}</p>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.ink,
      textColor: "#fff",
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <ShareCardScene data={data} profile={profile} shoppingTimeSavedHours={shoppingTimeSavedHours} showExportCta={showExportCta} />
      ),
    },
  ];
};

export default function App() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState(1);
  const touchStart = useRef(null);
  const [shareLoading, setShareLoading] = useState(false);
  const shareCaptureRef = useRef(null);
  const shareCardFrameRef = useRef(null);
  const [shareSnapshotShowCta, setShareSnapshotShowCta] = useState(false);

  const data = WRAPPED_DATA;
  const allSlides = slides(data, shareSnapshotShowCta);

  const goTo = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= allSlides.length) return;
    setDir(nextIdx > idx ? 1 : -1);
    setVisible(false);
    setTimeout(() => {
      setIdx(nextIdx);
      setVisible(true);
    }, 160);
  };

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? idx + 1 : idx - 1);
    touchStart.current = null;
  };

  const handleShare = async () => {
    if (shareLoading) return;

    const title = "FanStories - Your Year, Your Story";
    const text = `A personalized visual recap for every customer. ${FRESHPLATE_SHARE_URL}`;

    setShareLoading(true);
    try {
      const captureEl = shareCaptureRef.current;
      if (!captureEl) throw new Error("Share card not ready");
      const blob = await captureShareCardToPngBlob(captureEl, setShareSnapshotShowCta);
      const file = new File([blob], "fanstories-2025.png", { type: "image/png" });

      if (typeof navigator.share !== "function") {
        downloadPngBlob(blob);
        return;
      }

      const canShareFiles =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (!canShareFiles) {
        downloadPngBlob(blob);
        return;
      }

      try {
        await navigator.share({ files: [file], title, text });
      } catch (e) {
        if (e?.name === "AbortError") return;
        downloadPngBlob(blob);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setShareLoading(false);
    }
  };

  const slide = allSlides[idx];
  const isShareSlide = idx === allSlides.length - 1;
  const progressBar = PROGRESS_BAR[slide.progressBarTheme];

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button{cursor:pointer;border:none;transition:opacity .15s,transform .1s}
        button:hover:not(:disabled){opacity:.85} button:active:not(:disabled){transform:scale(.98)}
        button:disabled{opacity:.75;cursor:wait}
      `}</style>

      <div style={{ width: "100%", maxWidth: isShareSlide ? SHARE_STORY_W : 390 }}>
        <div>
          <div
            ref={shareCardFrameRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              borderRadius: isShareSlide ? 0 : 28,
              overflow: "hidden",
              width: isShareSlide ? SHARE_STORY_W : "100%",
              height: isShareSlide ? SHARE_STORY_H : 620,
              position: "relative",
              boxShadow: isShareSlide ? "none" : "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,240,232,0.06)",
              background: slide.bg,
              margin: isShareSlide ? "0 auto" : undefined,
            }}
          >
            <div
              ref={shareCaptureRef}
              style={
                isShareSlide
                  ? {
                      position: "relative",
                      width: SHARE_STORY_W,
                      height: SHARE_STORY_H,
                      boxSizing: "border-box",
                      padding: SHARE_STORY_PADDING,
                      background: slide.bg,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : `translateY(${dir * 14}px)`,
                      transition: "opacity 0.16s ease, transform 0.16s ease",
                      zIndex: 20,
                      overflow: "hidden",
                    }
                  : {
                      position: "absolute",
                      inset: 0,
                      padding: "36px 30px 60px",
                      background: slide.bg,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : `translateY(${dir * 14}px)`,
                      transition: "opacity 0.16s ease, transform 0.16s ease",
                      zIndex: 20,
                    }
              }
            >
              {slide.render()}
            </div>

            {idx < allSlides.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  left: 24,
                  right: 24,
                  zIndex: 35,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <FreshPlateLogo color={slide.logoOnDark ? "rgba(245,240,232,0.92)" : "rgba(26,26,26,0.85)"} size={1.05} />
              </div>
            )}

            <div style={{ position: "absolute", bottom: 24, left: 30, right: 30, display: "flex", gap: 5, zIndex: 30 }}>
              {allSlides.map((_, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    cursor: "pointer",
                    background: i <= idx ? progressBar.filled : progressBar.unfilled,
                    transition: "background 0.25s",
                  }}
                />
              ))}
            </div>

            <div
              onClick={() => goTo(idx - 1)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "35%",
                height: "100%",
                zIndex: 25,
                cursor: idx > 0 ? "pointer" : "default",
              }}
            />
            <div
              onClick={() => goTo(idx + 1)}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "35%",
                height: "100%",
                zIndex: 25,
                cursor: idx < allSlides.length - 1 ? "pointer" : "default",
              }}
            />
          </div>

          {idx === allSlides.length - 1 && (
            <button
              type="button"
              disabled={shareLoading}
              onClick={handleShare}
              style={{
                width: "100%",
                marginTop: 10,
                background: PALETTE.terracotta,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "15px 20px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {shareLoading ? (
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none" style={{ animation: "spin 0.85s linear infinite" }}>
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" strokeDasharray="66 200" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              )}
              Share my 2025 recap
            </button>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(245,240,232,0.22)", textAlign: "center", marginTop: 10 }}>
            Tap sides or swipe to navigate
          </p>
        </div>
      </div>

    </div>
  );
}
