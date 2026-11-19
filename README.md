[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/runtuhjiwa/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/runtuhjiwa/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 official PS5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).

- A checklist saved in the browser, with export to file and import back.
- Filters by kind (story, missable, collectibles, activities, online), grade, and search — plus a spoiler setting that hides story-trophy names and descriptions until earned.
- A roadmap to the platinum, with missable flags and the earliest point each trophy can be earned.
- A guide to each trophy in the entrant's own words, citing its source (PowerPyx, PlayStationTrophies.org, PSNProfiles, TrueTrophies, Exophase).

## Files

- `app/` — the static web app (open `app/index.html` in a desktop browser; it works offline, no network requests).
- `app/data/trophies.json` — the 55 official trophies with names, descriptions, grades, guides, sources, and earliest-point notes.
- `screenshots/` — renders of the running app.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty.
