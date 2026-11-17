
export default function handler(req, res) {
  const q = req.query;

  const name = String(q.name || "DartelX")
    .slice(0, 24)
    .replace(/[&<>"']/g, "");

  const level = Math.max(0, Number(q.level) || 1);
  const xp = Math.max(0, Number(q.xp) || 0);
  const maxxp = Math.max(1, Number(q.maxxp) || 100);

  const percent = Math.min(100, Math.round(xp / maxxp * 100));
  const width = percent * 5;

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
          font-size="38" font-weight="bold">${name}</text>

    <text x="220" y="120" fill="#B9A8CE"
          font-size="23">LEVEL ${level}</text>

    <text x="220" y="165" fill="#FFFFFF"
          font-size="19">XP ${xp} / ${maxxp}</text>

    <rect x="220" y="185" width="500" height="20"
          rx="10" fill="#30243E"/>
    <rect x="220" y="185" width="${width}" height="20"
          rx="10" fill="url(#bar)"/>

    <text x="735" y="202" fill="#D58AFF"
          font-size="23" font-weight="bold">${percent}%</text>

    <text x="780" y="45" fill="#A020F0"
          font-size="17" font-weight="bold">DARTELX</text>
  </svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.status(200).send(svg);
}
