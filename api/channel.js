// In-memory cache
let cachedData = null;
let lastFetchTime = 0;

export default async function handler(req, res) {
  const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes cache
  const rawName = req.query.channel || "";
  const channelName = decodeURIComponent(rawName).replace(/_/g, " ").trim();

  // ✅ Your GitHub playlist
  const sourceM3U = "https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u";

  try {
    // Serve from cache if valid
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
      return sendChannel(res, cachedData, channelName);
    }

    // Fetch fresh playlist
    const response = await fetch(sourceM3U, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) throw new Error(`Failed to fetch playlist (${response.status})`);

    const playlist = await response.text();

    // Update cache
    cachedData = playlist;
    lastFetchTime = Date.now();

    sendChannel(res, playlist, channelName);
  } catch (err) {
    res
      .status(500)
      .send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Server Error (${err.message})`);
  }
}

// 🔧 Helper function — find and return channel info
function sendChannel(res, playlist, channelName) {
  const regex = new RegExp(`(#EXTINF:-1[^\\n]*${channelName}[^\\n]*\\n)(https[^\\n]+)`, "i");
  const match = playlist.match(regex);

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=900"); // 15 mins browser cache

  if (match) {
    res.send(`#EXTM3U\n${match[1].trim()}\n${match[2].trim()}`);
  } else {
    res
      .status(404)
      .send(`#EXTM3U\n#EXTINF:-1,${channelName}\n#ERROR: Channel not found`);
  }
}
