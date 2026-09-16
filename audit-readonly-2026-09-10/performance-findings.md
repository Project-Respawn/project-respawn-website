# Frontend performance context

No frontend change or build was run. Measurements use existing local dist artifacts dated 3 September 2026, before current commit 7838e2b. These are not verified current production bundle sizes.

## Existing artifacts

| Path | Bytes | Gzip bytes (Node zlib) | Modified |
| --- | --- | --- | --- |
| dist\assets\main-DubfDrn2.js | 2248010 | 579919 | 2026-09-03T19:31:06.537Z |
| dist\assets\main-CMg6dDsG.css | 1074352 | 174950 | 2026-09-03T19:31:07.269Z |
| dist\assets\CoachPoolReview-ChiusX2i.js | 13918 | 4871 | 2026-09-03T19:31:06.608Z |
| dist\assets\LeagueOfLegendsTeam-lWUP8ma6.css | 11508 | 2642 | 2026-09-03T19:31:06.825Z |
| dist\assets\ChampionPool-slkC4a4g.js | 8219 | 3204 | 2026-09-03T19:31:06.559Z |
| dist\assets\TeamManagement-DpnsvcW-.js | 8067 | 3052 | 2026-09-03T19:31:06.643Z |
| dist\assets\CoachPoolReview-CGXRY8MJ.css | 7961 | 1902 | 2026-09-03T19:31:06.794Z |
| dist\assets\LeagueOfLegendsTeam-DwCF2jsy.js | 7745 | 2741 | 2026-09-03T19:31:06.608Z |
| dist\assets\TeamHubHome-Czv5vDD8.js | 7061 | 2820 | 2026-09-03T19:31:06.609Z |
| dist\assets\ChampionPool-zOYA0mr9.css | 6893 | 1756 | 2026-09-03T19:31:06.732Z |
| dist\assets\TeamHubHome-C5AGbfER.css | 6202 | 1658 | 2026-09-03T19:31:06.829Z |
| dist\assets\dataDragon.service-CQrsins-.js | 5034 | 1793 | 2026-09-03T19:31:06.697Z |

The main files are approximately 2.25 MB JS / 580 KB gzip and 1.07 MB CSS / 175 KB gzip. They support the earlier concern, but do not exactly reproduce the supplied 2.30 MB / 597 KB and 1.09 MB / 179 KB figures. Actual server compression may differ.

## Route imports

| Router module | Static imports | Dynamic imports |
| --- | --- | --- |
| src\router\admin.routes.js | 23 | 0 |
| src\router\features.routes.js | 6 | 0 |
| src\router\forum.routes.js | 4 | 0 |
| src\router\index.js | 10 | 0 |
| src\router\public.routes.js | 18 | 0 |

Public/admin/forum/feature route modules are statically imported at router entry. Individual route components can still be lazy-loaded; a static module import alone does not establish that every component is eager. Existing large main bundle suggests a separate route/component import review.

## Large images

| Path | Bytes |
| --- | --- |
| public\images\overlay-previews\fantasy-moba-draft.png | 2557084 |
| public\images\overlay-previews\battle-royale-draft.png | 2550927 |
| public\images\overlay-previews\science-fiction-rpg-draft.png | 2405185 |
| src\assets\esports\league-of-legends-season-zero.png | 2376099 |
| src\assets\esports\esports-phoenix-art.png | 2356104 |
| src\assets\esports\season-zero-jersey.png | 2129226 |
| src\assets\esports\respawn-community-cup.png | 2122837 |
| src\assets\esports\esports-background.png | 2086560 |
| public\images\overlay-previews\asymmetrical-horror-draft.png | 2083008 |
| src\assets\partners\ravens-gaming-logo.png | 1574633 |

## Stylesheet reference

| Path | Line | Reference |
| --- | --- | --- |
| src\main.js | 10 | import './css/styles.css'; |
| public\error.html | 7 | <link rel="stylesheet" href="/css/styles.css"> |

public/css/styles.css exists: false. public/error.html references /css/styles.css; the src/main.js relative import is a different source-level reference. No new build was run, so the historical build warning was not reproduced.

## Future frontend work

Review component lazy-loading, CSS imports, responsive image formats and the error-page stylesheet path, then measure a fresh authorised build and real browser delivery. These frontend recommendations are separate from AWS cleanup and do not imply any resource is removable.

