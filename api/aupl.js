import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const masterUrl = "https://nrtv-one.vercel.app/onetv.m3u";
    const channelsDir = path.join(process.cwd(), "public", "channels");

    // Ensure the channels directory exists
    if (!fs.existsSync(channelsDir)) fs.mkdirSync(channelsDir, { recursive: true });

    // Fetch the latest master M3U file
    const response = await fetch(masterUrl);
    if (!response.ok) throw new Error(`Failed to fetch master M3U: ${response.status}`);
    const text = await response.text();

    // Match channel blocks with #EXTINF and URL
    const blocks = text.match(/#EXTINF:[^\n]+\n(?:#KODIPROP:[^\n]+\n|#EXTVLCOPT:[^\n]+\n|#EXTHTTP:[^\n]+\n)*https?:\/\/[^\n]+/gm);

    if (!blocks || blocks.length === 0) {
      return res.status(400).send("❌ No channels found in the master M3U file.");
    }

    // Generate .m3u8 files for each channel
    for (const block of blocks) {
      const lines = block.trim().split("\n");
      const extinf = lines[0];
      const url = lines[lines.length - 1];
      const nameMatch = extinf.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : "Unknown_Channel";
      const filename = nam
