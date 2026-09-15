import fs from "node:fs/promises";
import path from "node:path";

async function fetchMetrics() {
  const defaultMetrics = {
    githubStars: 0,
    youtubeSubscribers: 0,
    youtubeViews: 0,
    lastUpdated: new Date().toISOString()
  };

  try {
    console.log("Fetching GitHub metrics for ahmed-ibrahim-asl...");
    const ghResponse = await fetch("https://api.github.com/users/ahmed-ibrahim-asl/repos?per_page=100");
    if (ghResponse.ok) {
      const repos = await ghResponse.json();
      defaultMetrics.githubStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    }
  } catch (err) {
    console.error("Failed to fetch GitHub metrics:", err);
  }

  // YouTube API requires a key, so we use a fallback if not provided
  try {
    console.log("Fetching YouTube metrics...");
    const ytKey = process.env.YOUTUBE_API_KEY;
    if (ytKey) {
      const ytResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=@ahmed-ibrahim-asl&key=${ytKey}`
      );
      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        if (ytData.items && ytData.items.length > 0) {
          defaultMetrics.youtubeSubscribers = parseInt(ytData.items[0].statistics.subscriberCount, 10) || 0;
          defaultMetrics.youtubeViews = parseInt(ytData.items[0].statistics.viewCount, 10) || 0;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch YouTube metrics:", err);
  }

  const outDir = path.join(process.cwd(), "data");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, "metrics.json"),
    JSON.stringify(defaultMetrics, null, 2)
  );
  console.log("Metrics saved to data/metrics.json");
}

fetchMetrics().catch(console.error);
