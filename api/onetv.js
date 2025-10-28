// /api/onetv.js

let cachedData = null;
let lastFetchTime = 0;

export default async function handler(req, res) {
  const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes
  const fileUrl = "https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u";

  // Serve from cache if still valid
  if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=900"); // 15 minutes
    return res.send(cachedData);
  }

  try {
    const response = await fetch(fileUrl, {
      headers: { "Cache-Control": "no-cache" }
    });

    if (!response.ok) {
      throw new Error(`GitHub fetch failed (${response.status})`);
    }

    const data = await response.text();

    // Update in-memory cache
    cachedData = data;
    lastFetchTime = Date.now();

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=900"); // 15 minutes
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Error fetching playlist from GitHub.");
  }
}
