# Bingo Maker Change Log

## 0.9.1 — 28 September 2026
### Changed
- Replaced Autumn's legacy CSS/inline-SVG imitation with a dedicated reusable illustrated frame asset at `assets/autumn-frame.svg`.
- Reduced the Autumn frame thickness on both mobile preview and A4 print.
- Kept the live BINGO header, number grid and FREE SPACE separate from the artwork layer.
- Disabled the old Autumn decoration SVGs so the app now renders the actual frame asset rather than a rough reconstruction.

### Testing required
- Visual match/quality of the installed Autumn theme.
- A4/PDF frame thickness and artwork rendering.
- Confirm number grid remains unobstructed.


## 0.9.0 — 28 September 2026
### Added
- Visible build number in the installed app.
- Persistent ISSUES.md register with Open, Fixing, Ready to test, Passed and Deferred states.
- Formal release rule requiring build, issue-log, change-log and cache updates.

### Current testing
- v8 protected theme artwork from the playable BINGO grid.
- Autumn Woodland visual quality is still unresolved and is not considered approved.
- A4/PDF rendering still requires verification against the installed app.

## Earlier prototype releases
- **v8** — protected the playable grid from theme artwork and removed the rejected cartoon badge overlay.
- **v7** — rebuilt A4 print geometry and introduced a richer Autumn artwork layer; visual overlap was found in testing.
- **v6** — introduced pastel BINGO tiles and broader Autumn framing.
- **v5** — introduced rotating Autumn woodland compositions and styled FREE SPACE.
- **v4** — moved decorations into an outer frame.
- **v3** — introduced reusable seasonal theme architecture.
- **v2 and earlier** — PWA/install/update foundation and original Bingo generator.

The number-generation rules are treated as protected behavior unless a future requirement explicitly changes them.
