
import sharp from "sharp";

export default async function handler(req, res) {
  try {
    const q = req.query;

    const escapeXML = (value) =>
      String(value).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
      })[c]);

    const name = escapeXML(
      String(q.name || "DartelX").slice(0, 24)
    );

    const number = (value, fallback, min, max) => {
      const n = Number(value);
      return Number.isFinite(n)
        ? Math.min(max, Math.max(min, n))
        : fallback;
    };

    const level = Math.floor(number(q.level, 1, 0, 100000));
    const xp = Math.floor(number(q.xp, 0, 0, 100000000));
    const maxxp = Math.floor(number(q.maxxp, 100, 1, 100000000));

    const percent = Math.min(100, Math.round(xp / maxxp * 100));
    const progress = percent * 5;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="900" height="260" viewBox="0 0 900 260">
      <defs>
        <linearGradient id="bg" x2="1" y2="1">
          <stop stop-color="#171124"/>
          <stop offset="1" stop-color="#08070D"/>
        </linearGradient>
        <linearGradient id="bar">
          <stop stop-color="#A020F0"/>
          <stop offset="1" stop-color="#D58AFF"/>
        </linearGradient>
      </defs>

      <rect width="900" height="260" rx="25" fill="url(#bg)"/>
      <rect x="2" y="2" width="896" height="256"
            rx="23" fill="none" stroke="#43205F"/>

      <circle cx="115" cy="125" r="68" fill="#A020F0"/>
      <circle cx="115" cy="125" r="61" fill="#211332"/>
      <text x="115" y="143" font-size="48"
            text-anchor="middle" fill="white">★</text>

      <text x="220" y="80" fill="white"
            font-size="38" font-weight="bold"
            font-family="Arial, sans-serif">${name}</text>

      <text x="220" y="120" fill="#B9A8CE"
            font-size="23">LEVEL ${level}</text>

      <text x="220" y="165" fill="#FFFFFF"
            font-size="19">XP ${xp} / ${maxxp}</text>

      <rect x="220" y="185" width="500" height="20"
            rx="10" fill="#30243E"/>

      <rect x="220" y="185" width="${progress}" height="20"
            rx="10" fill="url(#bar)"/>

      <text x="735" y="202" fill="#D58AFF"
            font-size="23" font-weight="bold">${percent}%</text>

      <text x="780" y="45" fill="#A020F0"
            font-size="17" font-weight="bold">DARTELX</text>
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
      error: "Failed to generate rank card"
    });
  }
}
