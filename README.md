# Not A Rabbit Hole

This project was started with the Astro init command (`npm create astro@latest`) on Node version `20.15.1`.

## Getting Started

```
npm install
npm run dev
```

## Scripts

### Fetch YouTube description

Fetches the description of a YouTube video and outputs it as HTML, ready to paste into the `video-description` frontmatter field of a new video `.md` file.

```
node scripts/fetch-yt-description.mjs <youtube-url>
```

## Deploy

This site is set to deploy with a GitHub action on commits to the `master` branch.
