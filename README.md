# Leonida Trophy Guide

[![Make GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/runtuhjiwa/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/runtuhjiwa/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Leonida Trophy Guide is an offline web app that tracks all 55 official PlayStation 5 trophies for Grand Theft Auto VI — 1 Platinum, 2 Gold, 6 Silver and 46 Bronze, including the 28 hidden ones. Every trophy has its official name and description plus a guide written in the author's own words, with a source note for the method. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## Features

- Complete list of all 55 trophies with grade, hidden and missable flags
- A guide for every trophy, each with a named source
- Roadmap to the Platinum in 7 ordered steps, with the one missable trophy called out first
- Click-to-check checklist saved in localStorage, with a live progress bar
- Export and import the checklist as JSON, so progress survives a new device
- Filters by grade, text search, and a hide-earned toggle
- Spoiler setting: hidden trophies stay masked as "Hidden Trophy" until you reveal them
- Works fully offline — no network requests, just static files

## Run it

Serve the folder and open the app:

```sh
node serve.ts
```

Then open http://localhost:8080. Or open `app/index.html` directly in a browser (the checklist still works, but the trophy data loads best over the local server).
