#!/usr/bin/env node
// Usage: node scripts/fetch-yt-description.mjs <youtube-url>

const url = process.argv[2];

if (!url) {
  console.error("Usage: node scripts/fetch-yt-description.mjs <youtube-url>");
  process.exit(1);
}

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

const html = await res.text();

const match = html.match(/var ytInitialData = ({.+?});<\/script>/s);
if (!match) {
  console.error("Could not find ytInitialData — YouTube may have returned a bot-check page.");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(match[1]);
} catch {
  console.error("Failed to parse ytInitialData JSON.");
  process.exit(1);
}

const contents =
  data?.contents?.twoColumnWatchNextResults?.results?.results?.contents ?? [];

const secondary = contents.find((c) => c.videoSecondaryInfoRenderer);
const attrDesc = secondary?.videoSecondaryInfoRenderer?.attributedDescription;

if (!attrDesc?.content) {
  console.log("");
  process.exit(0);
}

const content = attrDesc.content;
const commandRuns = attrDesc.commandRuns ?? [];

// Extract clean URL from YouTube redirect, falling back to the raw URL
function extractUrl(redirectUrl) {
  try {
    const u = new URL(redirectUrl);
    const q = u.searchParams.get("q");
    return q ?? redirectUrl;
  } catch {
    return redirectUrl;
  }
}

// Build a list of segments: { start, end, url | null }
// Sort runs by startIndex to process in order
const sorted = [...commandRuns].sort((a, b) => a.startIndex - b.startIndex);

// YouTube indices are UTF-16 code unit positions — use str.slice() directly
let segments = [];
let cursor = 0;

for (const run of sorted) {
  const start = run.startIndex;
  const end = start + run.length;
  if (cursor < start) {
    segments.push({ text: content.slice(cursor, start), url: null });
  }
  const rawUrl =
    run.onTap?.innertubeCommand?.urlEndpoint?.url ??
    run.onTap?.innertubeCommand?.commandMetadata?.webCommandMetadata?.url ??
    "";
  segments.push({ text: content.slice(start, end), url: extractUrl(rawUrl) });
  cursor = end;
}
if (cursor < content.length) {
  segments.push({ text: content.slice(cursor), url: null });
}

// Convert to HTML
function escape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toHtml(text) {
  // Split on newlines, escape, then rejoin with <br>
  return text.split("\n").map(escape).join("<br>");
}

let inner = "";
for (const seg of segments) {
  const htmlText = toHtml(seg.text);
  if (seg.url) {
    inner += `<a href="${seg.url}">${htmlText}</a>`;
  } else {
    inner += htmlText;
  }
}

// Collapse 3+ consecutive <br> to two, trim leading/trailing <br>
inner = inner.replace(/(<br>){3,}/g, "<br><br>").replace(/^(<br>)+|(<br>)+$/g, "").trim();

console.log(`<p>${inner}</p>`);
