import fetch from "node-fetch";

export default async function handler(req, res) {
  // ✅ use your onetv.m3u as source
  const sourceM3U = "https://nrtv-one.vercel.app/onetv.m3u";

  try {
    const response = await fetch(sourceM3U);
    const text = await response.text();

    const matches = [...text.matchAll(/#EXTINF:-1[^\n]*,(.+)\nhttps/g)];
    const channels = matches.map((m) => m[1].trim());

    res.status(200).json({ channels });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch channels", details: err.message });
  }
}
