export default async function handler(req, res) {
  const rawName = req.query.channel || "";
  const channelName = decodeURIComponent(rawName).replace(/_/g, " ").trim();

  // ✅ Source playlist from your GitHub repo
  const sourceM3U = "https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u";

  try {
    const response = await fetch(sourceM3U, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) throw new Error(`Failed to fetch playlist (${response.status})`);

    const playlist = await response.text();

    // Match the #EXTINF line and its next line (URL)
    const regex = new RegExp(`(#EXTINF:-1[^\\n]*${channelName}[^\\n]*\\n)(https[^\\n]+)`, "i");
    const match = playlist.match(regex);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");

    if (match) {
      res.send(`#EXTM3U\n${match[1].trim()}\n${match[2].trim()}`);
    } else {
      res.status(404).send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Channel not found`);
    }
  } catch (err) {
    res
      .status(500)
      .send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Server Error (${err.message})`);
  }
}
