# Bingo Maker Issue Register

This file is the persistent project issue log. An issue is only marked **Passed** after the live installed app/PDF has been tested successfully.

## Status key
- **Open** — confirmed problem, not yet fixed.
- **Fixing** — actively being worked on.
- **Ready to test** — code has been pushed and needs live/PDF verification.
- **Passed** — user has verified the fix.
- **Deferred** — deliberately postponed.

## Current issues

| ID | Status | Area | Issue | Introduced / observed | Target |
|---|---|---|---|---|---|
| BM-001 | Ready to test | Theme layout | Theme artwork could overlap BINGO header, number cells and bottom row. v8 moved decoration behind/protected from playable content. Needs live + PDF verification. | v7 | 0.9.x |
| BM-002 | Open | Autumn design | Autumn Woodland still does not meet the desired polished commercial illustrated-stationery quality. Earlier flat/cartoon artwork was rejected. | v3-v7 | 0.9.x |
| BM-003 | Ready to test | PDF/print | A4 PDF proportions and theme rendering differed from the app preview. Print geometry was rebuilt; needs verification after protected-frame changes. | v6-v7 | 0.9.x |
| BM-004 | Open | Theme assets | Autumn needs a professional reusable illustration asset system rather than simple geometric/emoji-style decoration. | v7 | 0.9.x |
| BM-005 | Deferred | Other themes | Halloween, Christmas, Easter, Spring and Celebration remain prototypes until Autumn establishes the approved visual standard. | v3 | After Autumn approval |
| BM-006 | Passed | Number generation | With repeats off, vertical sets 1/4/7, 2/5/8 and 3/6/9 share no repeated number within the corresponding B-I-N-G-O column. Existing generator retained. | Original | Preserved |
| BM-007 | Passed | Deployment | Installed PWA updates from the single GitHub Pages address without reinstalling. | Initial PWA setup | Preserved |
| BM-008 | Ready to test | Release visibility | App now displays its semantic build number so screenshots/tests identify the running release. | 0.9.0 | 0.9.0 |

## Release rule

Every code release must:
1. increment the visible build number;
2. update this issue register for any affected issue;
3. add an entry to CHANGELOG.md;
4. bump the service-worker cache version when client files change;
5. leave unresolved visual or functional problems Open/Ready to test until verified.

