export default async function handler(req, res) {
  const { channel } = req.query;
  
  if (!channel) {
    return res.status(400).send("Channel parameter missing");
  }

  // Example source — replace this with your logic
  const playlistUrl = "https://raw.githubusercontent.com/RJMBTS/Aupl/refs/heads/main/Master.m3u";

  const response = await fetch(playlistUrl);
  const text = await response.text();

  const lines = text.split("\n");
  const filtered = [];
  let include = false;

  for (const line of lines) {
    if (line.includes(channel)) {
      include = true;
      filtered.push(line);
    } else if (include && line.startsWith("http")) {
      filtered.push(line);
      include = false;
    }
  }

  if (filtered.length === 0) {
    return res.status(404).send("Channel not found");
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.send(filtered.join("\n"));
}
