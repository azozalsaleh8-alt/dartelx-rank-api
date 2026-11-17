
const sharp = require("sharp");
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const fontDir = path.join(process.cwd(), "fonts");

const arabicFont = fs.readFileSync(
  path.join(fontDir, "NotoSansArabic-Regular.ttf")
);

const englishFont = fs.readFileSync(
  path.join(fontDir, "DejaVuSans.ttf")
);

function escapeXML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function limit(value, max = 28) {
  return Array.from(String(value)).slice(0, max).join("");
}

function text(value, x, y, size = 26, color = "#fff") {
  const content = escapeXML(limit(value, 35));
  return `
    <text x="${x}" y="${y}"
      font-family="Noto Sans Arabic, DejaVu Sans"
      font-size="${size}"
      fill="${color}"
      direction="auto">${content}</text>
  `;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).send("Method not allowed");
    }

    const q = req.query;

    const name = limit(q.name || "DartelX User");
    const username = limit(q.username || "@user");
    const level = Math.max(0, Math.floor(number(q.level, 1)));
    const rank = Math.max(0, Math.floor(number(q.rank, 1)));
    const xp = Math.max(0, Math.floor(number(q.xp, 0)));
    const maxxp = Math.max(1, Math.floor(number(q.maxxp, 100)));

    const progress = Math.min(100, (xp / maxxp) * 100);
    const barWidth = 540 * progress / 100;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="1000" height="300" viewBox="0 0 1000 300">

      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#191024"/>
          <stop offset="100%" stop-color="#090711"/>
        </linearGradient>

        <linearGradient id="xp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#A020F0"/>
          <stop offset="100%" stop-color="#E49AFF"/>
        </linearGradient>
      </defs>

      <rect width="1000" height="300"
        rx="30" fill="url(#bg)"/>

      <rect x="2" y="2" width="996" height="296"
        rx="28" fill="none"
        stroke="#51266C" stroke-width="3"/>

      <circle cx="135" cy="145" r="79"
        fill="#25132F"
        stroke="#A020F0" stroke-width="9"/>

      ${text("LVL", 107, 135, 22, "#CFA5F4")}
      ${text(level, 109, 176, 38)}

      ${text(name, 260, 85, 35)}
      ${text(username, 260, 130, 23, "#B9A8C5")}

      ${text("LEVEL " + level, 260, 175, 24, "#DAB6F7")}

      <rect x="260" y="208" width="540" height="24"
        rx="12" fill="#33243D"/>

      <rect x="260" y="208" width="${barWidth}" height="24"
        rx="12" fill="url(#xp)"/>

      ${text(xp + " / " + maxxp + " XP", 260, 266, 20, "#D7C4E1")}

      ${text("RANK #" + rank, 820, 80, 22, "#DAB6F7")}
      ${text(Math.floor(progress) + "%", 820, 226, 24, "#E49AFF")}

    </svg>`;

    const renderer = new Resvg(svg, {
      font: {
        fontBuffers: [arabicFont, englishFont],
        loadSystemFonts: false,
        defaultFontFamily: "Noto Sans Arabic"
      }
    });

    const rendered = renderer.render().asPng();

    const png = await sharp(rendered)
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.status(200).send(png);

  } catch (error) {
    console.error("Rank API Error:", error);
    return res.status(500).json({
      error: "Rank card generation failed",
      message: error.message
    });
  }
};
