export default async function handler(req, res) {
  const { channel } = req.query;
  if (!channel) return res.status(400).send("Channel parameter missing");

  const source = "https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u";
  const response = await fetch(source);
  const text = await response.text();

  const regex = new RegExp(`(#EXTINF:-1[^\n]*${channel.replace(/_/g, " ")}[^\n]*\\n)(https[^\n]+)`, "i");
  const match = text.match(regex);

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

  if (match) {
    res.send(`#EXTM3U\n${match[1].trim()}\n${match[2].trim()}`);
  } else {
    res.status(404).send(`#EXTM3U\n#EXTINF:-1,${channel}\n#ERROR: Not found`);
  }
}
