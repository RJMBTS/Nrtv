import fetch from "node-fetch";

export default async function handler(req, res) {
  const rawName = req.query.channel || "";
  const channelName = decodeURIComponent(rawName).replace(/_/g, " ");
  
  // ✅ use your own m3u file as the source
  const sourceM3U = "https://nrtv-one.vercel.app/onetv.m3u";

  try {
    const response = await fetch(sourceM3U);
    if (!response.ok) throw new Error("Failed to fetch source playlist");
    const text = await response.text();

    const regex = new RegExp(`(#EXTINF:-1[^\n]*${channelName}[^\n]*\\n)(https[^\n]+)`, "i");
    const match = text.match(regex);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    if (match) {
      res.send(`${match[1].trim()}\n${match[2].trim()}`);
    } else {
      res.status(404).send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Not found or expired`);
    }
  } catch (err) {
    res
      .status(500)
      .send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Server Error (${err.message})`);
  }
}
