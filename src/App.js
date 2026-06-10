import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  SHARE_PNG_FILENAME,
  SHARE_SHEET_TITLE,
  captureShareCardToPngBlob,
  getShareCaptureHostStyle,
} from "./shareCapture";

const WRAPPED_DATA = {
  meals: 312,
  minutes_saved: 624,
  favorite_meal: "Roasted Salmon, Shallot Beurre Blanc",
  healthy_streak: 47,
  co2_saved: 156,
  nights_without_cooking: 312,
  cooking_style: "health",
};

const SCRATCH_COOK_MINS = 30;
const WECOOK_HEAT_MINS = 2;
const TAKEOUT_KG_PER_MEAL = 2.5;

const MEAL_PHOTO_SRC = "/meal.jpg";
const MEAL_PHOTO_HEIGHT = 160;

const mealPhotoImgStyle = {
  width: "100%",
  height: MEAL_PHOTO_HEIGHT,
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

const PALETTE = {
  green: "#03894e",
  white: "#FFFFFF",
  dark: "#0A0A0A",
  lightGray: "#F5F5F5",
  greenLight: "#E8F5EE",
  greenMuted: "rgba(3,137,78,0.12)",
};

const PROGRESS_BAR = {
  dark: { filled: "#ffffff", unfilled: "rgba(255,255,255,0.35)" },
  light: { filled: PALETTE.green, unfilled: "rgba(3,137,78,0.18)" },
};

const PROFILE_CONTENT = {
  health: {
    title: "The Health Conscious",
    body: "Every meal balanced, every choice intentional. You made clean eating look effortless this year.",
    shareSummary: "Every meal balanced, every choice intentional. You made clean eating look effortless this year.",
  },
  parent: {
    title: "The Busy Parent",
    body: "Dinner on the table in 2 minutes, smiles around it every night. You made it look easy.",
    shareSummary: "Dinner on the table in 2 minutes, smiles around it every night. You made it look easy.",
  },
  foodie: {
    title: "The Foodie",
    body: "Chef-prepared, restaurant-quality, at your door. You never once settled for ordinary.",
    shareSummary: "Chef-prepared, restaurant-quality, at your door. You never once settled for ordinary.",
  },
  early: {
    title: "The Early Riser",
    body: "Planned ahead, never scrambled. You had dinner sorted before most people thought about lunch.",
    shareSummary: "Planned ahead, never scrambled. You had dinner sorted before most people thought about lunch.",
  },
  habit: {
    title: "The Creature of Habit",
    body: "You found what you love and owned it. Consistency is its own kind of wisdom.",
    shareSummary: "You found what you love and owned it. Consistency is its own kind of wisdom.",
  },
};

const profileFromData = (data) => PROFILE_CONTENT[data.cooking_style] || PROFILE_CONTENT.health;

const minutesSavedTotalFromData = (data) => data.meals * (SCRATCH_COOK_MINS - WECOOK_HEAT_MINS);

const hoursSavedFromData = (data) => Math.round(minutesSavedTotalFromData(data) / 60);

const WecookBoxLogo = ({ fontSize = 48 }) => (
  <div style={{ width: "100%" }}>
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 900,
        fontSize,
        color: PALETTE.white,
        lineHeight: 1,
        letterSpacing: -2,
        textTransform: "lowercase",
      }}
    >
      wecook
    </div>
    <div
      style={{
        marginTop: 2,
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.2,
        color: "rgba(255,255,255,0.55)",
        lineHeight: 1.35,
      }}
    >
      <span style={{ fontWeight: 900, color: "rgba(255,255,255,0.85)" }}>Ready-to-Eat</span>
      {" · "}
      Made to Enjoy
    </div>
  </div>
);

const ShareExportCta = () => (
  <div
    style={{
      width: "100%",
      background: PALETTE.white,
      borderRadius: 12,
      padding: "14px 16px",
      textAlign: "center",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}
  >
    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: PALETTE.green, lineHeight: 1.3 }}>
      Try wecook
    </div>
    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: PALETTE.dark, lineHeight: 1.4, marginTop: 4 }}>
      Use code REVIEW2026 for 15% off
    </div>
  </div>
);

const ShareCardScene = ({ data, profile, hoursSaved, variant = "card", includeExportCta = false }) => {
  const isStory = variant === "story";
  const isCard = variant === "card";
  const isExportStory = isStory && includeExportCta;
  const gap = isCard ? 8 : isExportStory ? 10 : isStory ? 8 : 6;
  const statRowMin = isCard ? 52 : isExportStory ? 56 : isStory ? 52 : 44;
  const statValSize = isCard ? 22 : isExportStory ? 24 : isStory ? 20 : 18;
  const statLabelSize = isCard ? 10 : isExportStory ? 11 : 9;
  const personaTitleSize = isCard ? 18 : isExportStory ? 19 : isStory ? 16 : 14;
  const personaLabelSize = isCard ? 10 : isExportStory ? 11 : 9;
  const personaBodySize = isCard ? 12 : isExportStory ? 12 : isStory ? 11 : 10;
  const reviewTitleSize = isCard ? 26 : isExportStory ? 26 : isStory ? 20 : 18;
  const mealLabelSize = isCard ? 9 : isExportStory ? 10 : 8;
  const mealTitleSize = isCard ? 16 : isExportStory ? 16 : isStory ? 14 : 13;
  const boxPadding = isCard ? "10px 12px" : isExportStory ? "10px 12px" : isStory ? "8px 10px" : "7px 9px";
  const statBoxPadding = isCard ? "10px 12px" : isExportStory ? "10px 12px" : isStory ? "8px 10px" : "6px 8px";

  return (
    <div
      style={{
        position: isExportStory ? "relative" : "absolute",
        inset: isExportStory ? undefined : 0,
        width: "100%",
        height: isExportStory ? "100%" : "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 15% 85%, rgba(255,255,255,0.12) 0%, transparent 55%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 90% 8%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: isExportStory ? "auto" : "100%",
          minHeight: isExportStory ? "100%" : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: isExportStory ? "flex-start" : undefined,
          gap: isExportStory ? 10 : gap,
          overflow: "hidden",
          boxSizing: "border-box",
          ...(isCard ? { padding: "4px 14px 0" } : {}),
          ...(isExportStory ? { padding: "12px 8px 0" } : {}),
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: isExportStory ? 10 : gap,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              gap: isExportStory ? 8 : isCard ? 10 : isStory ? 8 : 6,
              ...(isCard ? { paddingTop: 6, paddingBottom: 2 } : {}),
              ...(isExportStory ? { paddingTop: 10, paddingBottom: 4 } : {}),
            }}
          >
            <WecookBoxLogo />
            <div
              style={{
                width: "100%",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: reviewTitleSize,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.1,
                letterSpacing: -0.3,
                marginTop: isCard ? 12 : 8,
              }}
            >
              Your 2026 Review
            </div>
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
          </div>

          <div
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: boxPadding,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: personaLabelSize, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>
              Your profile
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: personaTitleSize, color: PALETTE.white, lineHeight: 1.15 }}>{profile.title}</div>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontFamily: "'Inter', sans-serif",
                fontSize: personaBodySize,
                fontWeight: 400,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.35,
              }}
            >
              {profile.shareSummary ?? profile.body}
            </p>
          </div>

          <div
            style={{
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gridTemplateRows: `repeat(2, minmax(${statRowMin}px, 1fr))`,
              gap: isCard ? 7 : isExportStory ? 9 : isStory ? 7 : 6,
              width: "100%",
            }}
          >
            {[
              { val: data.meals, lbl: "meals enjoyed", accent: PALETTE.white },
              { val: `${hoursSaved}h`, lbl: "time saved", accent: PALETTE.white },
              { val: data.healthy_streak, lbl: "day streak", accent: PALETTE.white },
              { val: `${data.co2_saved} kg`, lbl: "CO₂ saved", accent: PALETTE.white },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: statBoxPadding,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: statValSize, color: s.accent, lineHeight: 1, letterSpacing: -0.3 }}>{s.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: statLabelSize, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 3 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: MEAL_PHOTO_HEIGHT,
              flexShrink: 0,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              backgroundColor: PALETTE.dark,
            }}
          >
            <img src={MEAL_PHOTO_SRC} alt={`${data.favorite_meal} dish`} style={mealPhotoImgStyle} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.4) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "8px 10px",
                background: "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.88) 40%, rgba(10,10,10,0.95) 100%)",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: mealLabelSize, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 2 }}>
                Favorite meal
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: mealTitleSize, color: PALETTE.white, lineHeight: 1.15 }}>{data.favorite_meal}</div>
            </div>
          </div>

          {isCard && (
            <p
              style={{
                flexShrink: 0,
                margin: 0,
                marginTop: 8,
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.4,
              }}
            >
              Thank you for making us part of your everyday!
            </p>
          )}
        </div>

        {includeExportCta && (
          <div
            style={{
              flexShrink: 0,
              width: "100%",
              ...(isExportStory ? { marginTop: 10 } : { marginTop: "auto" }),
            }}
          >
            <ShareExportCta />
          </div>
        )}
      </div>
    </div>
  );
};

const downloadPngBlob = (blob, filename = SHARE_PNG_FILENAME) => {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const WecookMark = ({ onDark = false, size = 1 }) => (
  <span
    style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 800,
      fontSize: 18 * size,
      color: onDark ? PALETTE.white : PALETTE.green,
      letterSpacing: -0.3,
      lineHeight: 1.05,
    }}
  >
    wecook
  </span>
);

const FreshAccent = ({ opacity = 0.06 }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice">
    <circle cx="320" cy="80" r="140" fill={PALETTE.green} opacity={opacity} />
    <circle cx="60" cy="580" r="120" fill={PALETTE.green} opacity={opacity * 0.7} />
    <circle cx="200" cy="350" r="90" fill={PALETTE.green} opacity={opacity * 0.4} />
  </svg>
);

const slides = (data) => {
  const profile = profileFromData(data);
  const hoursSaved = hoursSavedFromData(data);
  const minutesSavedTotal = minutesSavedTotalFromData(data);
  const takeoutIfOrdered = data.meals * TAKEOUT_KG_PER_MEAL;
  const mealsPerWeek = (data.meals / 52).toFixed(1);

  return [
    {
      bg: PALETTE.white,
      textColor: PALETTE.dark,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <FreshAccent opacity={0.05} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ height: 48 }} />
            <div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: 48,
                  color: PALETTE.dark,
                  lineHeight: 1.08,
                  letterSpacing: -1,
                  marginBottom: 16,
                }}
              >
                Your year
                <br />
                with <span style={{ color: PALETTE.green }}>wecook</span>.
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(10,10,10,0.55)", lineHeight: 1.65, maxWidth: 290 }}>
                A fresh look back at the meals you enjoyed, the time you saved, and the habits you built.
              </p>
            </div>
            <div style={{ height: 8 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.green,
      textColor: PALETTE.white,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <FreshAccent opacity={0.08} />
          <div style={{ position: "absolute", right: -28, top: "50%", transform: "translateY(-46%)", zIndex: 2, pointerEvents: "none", lineHeight: 0.78 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 240, color: "rgba(0,0,0,0.08)", letterSpacing: -8, display: "block" }}>{data.meals}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2.2, fontWeight: 600, marginTop: 48 }}>
              This year you enjoyed
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 128, color: PALETTE.white, lineHeight: 0.85, letterSpacing: -4, marginBottom: 10 }}>{data.meals}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.95)", lineHeight: 1.05, marginBottom: 24 }}>meals.</div>
              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 14, padding: "14px 18px", display: "inline-block", maxWidth: "100%" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
                  About {mealsPerWeek} delicious meals per week—{data.nights_without_cooking} nights without cooking from scratch.
                </span>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.lightGray,
      textColor: PALETTE.dark,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <FreshAccent opacity={0.04} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginTop: 48 }}>
              Time back in your day
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 96, color: PALETTE.green, lineHeight: 0.9, letterSpacing: -3, marginBottom: 6 }}>{hoursSaved}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 26, color: PALETTE.dark, lineHeight: 1.2, marginBottom: 20 }}>hours saved</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: PALETTE.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${PALETTE.greenMuted}` }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>
                    vs cooking from scratch
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: PALETTE.dark, lineHeight: 1.5 }}>
                    {data.meals} meals × ({SCRATCH_COOK_MINS} min cooking − {WECOOK_HEAT_MINS} min heat) ={" "}
                    <strong style={{ color: PALETTE.green }}>{minutesSavedTotal.toLocaleString()} min</strong>
                  </div>
                </div>
                <div style={{ background: PALETTE.greenLight, borderRadius: 14, padding: "14px 16px", border: `1px solid rgba(3,137,78,0.15)` }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(10,10,10,0.65)", lineHeight: 1.55 }}>
                    That's <strong style={{ color: PALETTE.green }}>{hoursSaved} hours</strong> you got back—for family, rest, or whatever matters most.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.green,
      textColor: PALETTE.white,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => (
        <>
          <FreshAccent opacity={0.07} />
          <div style={{ position: "absolute", right: -20, top: "20%", opacity: 0.06, zIndex: 2, pointerEvents: "none" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 180, color: PALETTE.white, letterSpacing: -6, lineHeight: 1 }}>{data.healthy_streak}</span>
          </div>
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginTop: 48 }}>
              Healthy eating streak
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 120, color: PALETTE.white, lineHeight: 1, letterSpacing: -3 }}>{data.healthy_streak}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>days</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.65, marginBottom: 20 }}>
                Nearly seven weeks of balanced, wholesome meals in a row. Consistency is the secret ingredient—and you nailed it.
              </p>
              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.55 }}>
                  Real food, real routine. Your streak proves healthy eating can fit any schedule.
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      textColor: PALETTE.dark,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <FreshAccent opacity={0.04} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginTop: 48, flexShrink: 0 }}>
              Your favorite meal
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, paddingBottom: 4 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 32, color: PALETTE.dark, lineHeight: 1.12, marginBottom: 14, marginTop: 10 }}>{data.favorite_meal}</div>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: MEAL_PHOTO_HEIGHT,
                  flexShrink: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 14,
                  boxShadow: "0 8px 28px rgba(3,137,78,0.12)",
                }}
              >
                <img src={MEAL_PHOTO_SRC} alt={`${data.favorite_meal} dish`} style={mealPhotoImgStyle} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.25) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(10,10,10,0.55)", lineHeight: 1.6, marginBottom: 12, flexShrink: 0 }}>
                Silky beurre blanc, tender salmon—the dish you came back to again and again. Restaurant-worthy, unmistakably yours.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0, marginTop: "auto" }}>
                <div style={{ background: PALETTE.greenLight, borderRadius: 14, padding: "16px 16px", border: `1px solid rgba(3,137,78,0.15)` }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6, fontWeight: 600 }}>Times ordered</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, color: PALETTE.green, fontWeight: 800, lineHeight: 1.2 }}>18×</div>
                </div>
                <div style={{ background: PALETTE.lightGray, borderRadius: 14, padding: "16px 16px", border: "1px solid rgba(10,10,10,0.06)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 6, fontWeight: 600 }}>Heat time</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, color: PALETTE.dark, fontWeight: 800, lineHeight: 1.2 }}>{WECOOK_HEAT_MINS} min</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.lightGray,
      textColor: PALETTE.dark,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <FreshAccent opacity={0.04} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.45)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginTop: 48 }}>
              Planet & plate
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 72, color: PALETTE.green, lineHeight: 1 }}>{data.co2_saved}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 600, color: "rgba(10,10,10,0.65)" }}>kg CO₂ saved</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(10,10,10,0.6)", lineHeight: 1.65, marginBottom: 24 }}>
                Compared to restaurants and takeout (~{TAKEOUT_KG_PER_MEAL} kg CO₂ per meal), your wecook meals avoided roughly{" "}
                <strong style={{ color: PALETTE.green, fontWeight: 700 }}>{takeoutIfOrdered.toFixed(0)} kg</strong> in delivery-forward emissions across {data.meals} meals.
              </p>
              <div style={{ background: PALETTE.white, borderRadius: 14, padding: "16px 18px", border: `1px solid ${PALETTE.greenMuted}` }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(10,10,10,0.7)", lineHeight: 1.55 }}>
                  Same great food, lighter footprint—every meal was a vote for fewer cars idling at the curb.
                </div>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.white,
      textColor: PALETTE.dark,
      progressBarTheme: "light",
      logoOnDark: false,
      render: () => (
        <>
          <FreshAccent opacity={0.05} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(180deg, transparent, ${PALETTE.greenLight})`, zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.4)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginTop: 48 }}>
              Your wecook identity
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: profile.title.length > 18 ? 34 : 40,
                  color: PALETTE.dark,
                  lineHeight: 1.05,
                  letterSpacing: -0.5,
                  marginBottom: 22,
                }}
              >
                {profile.title.split(" ").map((w, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {w}
                  </span>
                ))}
              </div>
              <div style={{ background: PALETTE.green, borderRadius: 16, padding: "22px 22px" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: PALETTE.white, lineHeight: 1.75, fontWeight: 400 }}>{profile.body}</p>
              </div>
            </div>
            <div style={{ height: 4 }} />
          </div>
        </>
      ),
    },

    {
      bg: PALETTE.green,
      textColor: PALETTE.white,
      progressBarTheme: "dark",
      logoOnDark: true,
      render: () => <ShareCardScene data={data} profile={profile} hoursSaved={hoursSaved} variant="card" />,
    },
  ];
};

export default function App() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dir, setDir] = useState(1);
  const touchStart = useRef(null);
  const [sharePreparing, setSharePreparing] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const shareCaptureRef = useRef(null);
  const shareCardFrameRef = useRef(null);
  const cachedShareFile = useRef(null);
  const cachedShareBlob = useRef(null);
  const sharePregenGenRef = useRef(0);
  const data = WRAPPED_DATA;
  const profile = profileFromData(data);
  const hoursSaved = hoursSavedFromData(data);
  const allSlides = slides(data);
  const lastSlideIdx = allSlides.length - 1;

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

  useEffect(() => {
    if (idx !== lastSlideIdx || !visible) {
      sharePregenGenRef.current += 1;
      cachedShareFile.current = null;
      cachedShareBlob.current = null;
      setShareReady(false);
      setSharePreparing(false);
      return;
    }

    const gen = ++sharePregenGenRef.current;
    cachedShareFile.current = null;
    cachedShareBlob.current = null;
    setShareReady(false);
    setSharePreparing(true);

    let cancelled = false;

    const runPregen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 380));
      if (cancelled || sharePregenGenRef.current !== gen) return;

      const captureEl = shareCaptureRef.current;
      if (!captureEl) {
        if (!cancelled && sharePregenGenRef.current === gen) setSharePreparing(false);
        return;
      }

      try {
        const blob = await captureShareCardToPngBlob(captureEl);
        if (cancelled || sharePregenGenRef.current !== gen) return;
        cachedShareBlob.current = blob;
        cachedShareFile.current = new File([blob], SHARE_PNG_FILENAME, { type: "image/png" });
        setShareReady(true);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled && sharePregenGenRef.current === gen) setSharePreparing(false);
      }
    };

    runPregen();

    return () => {
      cancelled = true;
      sharePregenGenRef.current += 1;
    };
  }, [idx, visible, lastSlideIdx]);

  const handleShare = () => {
    if (sharePreparing || !shareReady) return;

    const file = cachedShareFile.current;
    const blob = cachedShareBlob.current;
    if (!file || !blob) return;

    if (typeof navigator.share !== "function") {
      downloadPngBlob(blob);
      return;
    }

    const canShareFiles = typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

    if (!canShareFiles) {
      downloadPngBlob(blob);
      return;
    }

    navigator.share({ files: [file], title: SHARE_SHEET_TITLE }).catch((e) => {
      if (e?.name === "AbortError") return;
      downloadPngBlob(blob);
    });
  };

  const slide = allSlides[idx];
  const isLastSlide = idx === lastSlideIdx;
  const progressBar = PROGRESS_BAR[slide.progressBarTheme];

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.lightGray, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button{cursor:pointer;border:none;transition:opacity .15s,transform .1s}
        button:hover:not(:disabled){opacity:.85} button:active:not(:disabled){transform:scale(.98)}
        button:disabled{opacity:.75;cursor:wait}
      `}</style>

      <div style={{ width: "100%", maxWidth: 390 }}>
        <div>
          <div
            ref={shareCardFrameRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              borderRadius: 28,
              overflow: "hidden",
              width: "100%",
              height: 620,
              position: "relative",
              boxShadow: "0 12px 40px rgba(3,137,78,0.15), 0 0 0 1px rgba(3,137,78,0.08)",
              background: slide.bg,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: isLastSlide ? "52px 36px 56px" : "36px 30px 60px",
                background: slide.bg,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${dir * 14}px)`,
                transition: "opacity 0.16s ease, transform 0.16s ease",
                zIndex: 20,
                overflow: "hidden",
              }}
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
                <WecookMark onDark={slide.logoOnDark} size={1.05} />
              </div>
            )}

            <div style={{ position: "absolute", bottom: 24, left: 30, right: 30, display: "flex", gap: 5, zIndex: 30 }}>
              {allSlides.map((_, i) => (
                <div
                  key={i}
                  data-testid={`progress-dot-${i}`}
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

          {idx === lastSlideIdx &&
            createPortal(
              <div ref={shareCaptureRef} aria-hidden="true" data-testid="share-capture-host" style={getShareCaptureHostStyle()}>
                <ShareCardScene data={data} profile={profile} hoursSaved={hoursSaved} variant="story" includeExportCta />
              </div>,
              document.body
            )}

          {idx === lastSlideIdx && (
            <button
              type="button"
              disabled={sharePreparing || !shareReady}
              onClick={handleShare}
              style={{
                width: "100%",
                marginTop: 10,
                background: PALETTE.green,
                color: PALETTE.white,
                border: "none",
                borderRadius: 12,
                padding: "15px 20px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 0.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: sharePreparing ? 0.85 : 1,
              }}
            >
              {sharePreparing && (
                <svg width="18" height="18" viewBox="0 0 100 100" fill="none" style={{ animation: "spin 0.85s linear infinite", flexShrink: 0 }}>
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" strokeDasharray="66 200" strokeLinecap="round" />
                </svg>
              )}
              {sharePreparing ? "Preparing…" : "Share my 2026 review"}
            </button>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(10,10,10,0.35)", textAlign: "center", marginTop: 10 }}>
            Tap sides or swipe to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
