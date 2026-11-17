
const sharp = require("sharp");

function escapeXML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function limit(value, max = 25) {
  return Array.from(String(value)).slice(0, max).join("");
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function text(value, x, y, size = 25, color = "#FFFFFF", anchor = "start") {
  return `<text
    x="${x}"
    y="${y}"
    fill="${color}"
    font-size="${size}"
    font-family="DejaVu Sans, Arial, sans-serif"
    font-weight="bold"
    text-anchor="${anchor}"
  >${escapeXML(value)}</text>`;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).send("Method not allowed");
    }

    const q = req.query || {};

    const name = limit(q.name || "DartelX User");
    const username = limit(q.username || "@user");
    const level = safeNumber(q.level, 1);
    const rank = safeNumber(q.rank, 1);
    const xp = safeNumber(q.xp, 0);
    const maxxp = Math.max(1, safeNumber(q.maxxp, 100));

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

        <clipPath id="progressClip">
          <rect x="260" y="208" width="540" height="24" rx="12"/>
        </clipPath>
      </defs>

      <rect width="1000" height="300" rx="30" fill="url(#bg)"/>

      <rect x="2" y="2" width="996" height="296"
        rx="28" fill="none"
        stroke="#51266C" stroke-width="3"/>

      <circle cx="135" cy="145" r="79"
        fill="#25132F"
        stroke="#A020F0" stroke-width="9"/>

      ${text("LVL", 135, 135, 22, "#CFA5F4", "middle")}
      ${text(level, 135, 176, 38, "#FFFFFF", "middle")}

      ${text(name, 260, 85, 35)}
      ${text(username, 260, 130, 23, "#B9A8C5")}

      ${text("LEVEL " + level, 260, 175, 24, "#DAB6F7")}

      <rect x="260" y="208" width="540" height="24"
        rx="12" fill="#33243D"/>

      <g clip-path="url(#progressClip)">
        <rect x="260" y="208" width="${barWidth}" height="24"
          fill="url(#xp)"/>
      </g>

      ${text(xp + " / " + maxxp + " XP", 260, 266, 20, "#D7C4E1")}

      ${text("RANK #" + rank, 820, 80, 22, "#DAB6F7")}
      ${text(Math.floor(progress) + "%", 820, 226, 24, "#E49AFF")}

    </svg>`;

    const png = await sharp(Buffer.from(svg))
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
