import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const masterUrl = "https://nrtv-one.vercel.app/onetv.m3u";
    const channelsDir = path.join(process.cwd(), "public", "channels");

    if (!fs.existsSync(channelsDir)) fs.mkdirSync(channelsDir, { recursive: true });

    const response = await fetch(masterUrl);
    if (!response.ok) throw new Error(`Failed to fetch master M3U: ${response.status}`);
    const text = await response.text();

    const blocks = text.match(
      /#EXTINF:[^\n]+\n(?:#KODIPROP:[^\n]+\n|#EXTVLCOPT:[^\n]+\n|#EXTHTTP:[^\n]+\n)*https?:\/\/[^\n]+/gm
    );

    if (!blocks?.length) {
      return res.status(400).send("❌ No channels found in the master M3U file.");
    }

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      const extinf = lines[0];
      const url = lines[lines.length - 1];
      const nameMatch = extinf.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : "Unknown_Channel";
      const filename = name.replace(/[^a-zA-Z0-9_-]+/g, "_") + ".m3u8";

      fs.writeFileSync(
        path.join(channelsDir, filename),
        `#EXTM3U\n${extinf}\n${url}\n`,
        "utf-8"
      );
    }

    return res
      .status(200)
      .send(`✅ Auto-updated ${blocks.length} channels successfully at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).send(`❌ Error: ${error.message}`);
  }
}
