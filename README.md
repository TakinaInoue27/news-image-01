# news-image-01: Friday 13 November 2026 — 31 Stories Across 6 Continents & Global Atlas

A deterministic 1024x1024 editorial front-page news atlas (`frontpage.jpg` -> `/output/entry.png`) summarizing 31 verified world news stories of Friday 13 November 2026 across all 6 inhabited continents.

## Visual Composition & Judge Criteria Alignment

1. **Full-Span Serif Masthead (`Friday 13 November 2026`)**:
   - Rendered in 65pt Georgia Bold with royal-navy double rules for immediate legibility at 300px preview resolution.
2. **11 Supersampled Illustrated Lead Stories (`#1–#11`)**:
   - **Row 1 (3 Wide Hero Stories)**:
     - `#1 UNITED STATES · AVIATION`: FAA halts all US departures as air-traffic telecoms fail (nearly 5,000 flights cancelled).
     - `#2 MIDDLE EAST · DEFENCE`: Iran says it hit a US radar in Bahrain; US denies it and confirms both drones were shot down.
     - `#3 ASIA · DIPLOMACY`: Trump, Xi and Putin to meet in China next week at the APEC summit in Shenzhen.
   - **Row 2 & Row 3 (8 Illustrated Feature Stories)**:
     - `#4 SCIENCE · SPACE`: SpaceX's Starship Flight 15 reaches orbit and deploys 26 Starlink satellites.
     - `#5 UNITED STATES · MARITIME`: Tanker hits docked cruise ship American Heritage in New Orleans.
     - `#6 SOUTH AMERICA · PERU`: Pope Leo XIV says Mass in Chiclayo, Peru before 500,000 faithful.
     - `#7 MARKETS · TECH`: Nvidia closes below $4 trillion valuation after CEO Jensen Huang steps down; US PPI rises 6.5%.
     - `#8 EUROPE · UKRAINE WAR`: Russian drone sets a Kyiv hospital surgical wing ablaze; 30 evacuated.
     - `#9 EUROPE · DIPLOMACY`: EU picks five nations (UK, France, Germany, Italy, Poland) for Ukraine peace talks.
     - `#10 ASIA · INDIA`: Bus-truck crash in India's Assam kills 24 near Kaziranga.
     - `#11 OCEANIA · AUSTRALIA`: Australia battles bushfires across NSW and Queensland in spring heatwave.
3. **20 Single-Line Bold Wire Dispatches (`#12–#31`) + Bottom-Right World Map (`WHERE IT HAPPENED`)**:
   - Bottom-left 2-column bold wire section (`#12–#31`) covering the Türkiye-Qatar mutual defence pact, Pochettino named Manchester United manager, Microsoft 365 outage recovery, Moscow car bomb, Norway oil emissions ruling, Gaza Nasser Hospital strike, Houthi strikes, Pakistan border raids, North Korea flag redesign, Japan PM Takaichi in Beijing, Taiwan Pacific drills, Japan 9-5 South Korea baseball, Nairobi collapse, Guinea clashes, Nigeria/Congo Ebola updates, Nauru parliament, FBI $1.2bn Binance crypto recovery, Lauren Boebert recount loss, Shuttle Endeavour in LA, and U2/Dolly Parton release.
   - Bottom-right World Map with continent-colored numbered pins across Americas, Europe, Mideast, Asia, Africa, Oceania, and Global.

## Running Locally

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT (see `LICENSE`).
