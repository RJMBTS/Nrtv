export const config = {
  runtime: "edge", // fast and auto-scaled
};

export default async function handler(request) {
  try {
    const res = await fetch("https://nrtv-one.vercel.app/onetv.m3u", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      return new Response("Failed to fetch source playlist.", { status: 500 });
    }

    const text = await res.text();

    // Extract .m3u8-like links or .mpd links
    const matches = [...text.matchAll(/#EXTINF[^\n]*\n(https?:\/\/[^\s]+)/g)];
    const channels = matches.map((m) => ({
      title: (m[0].match(/,(.*)/) || [])[1] || "Unknown Channel",
      url: m[1].replace(/\.mpd(\?.*)?$/, ".m3u8$1"), // optional: convert .mpd → .m3u8
    }));

    // Generate an M3U8 playlist dynamically
    let playlist = "#EXTM3U\n";
    channels.forEach((c) => {
      playlist += `#EXTINF:-1,${c.title}\n${c.url}\n`;
    });

    return new Response(playlist, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
