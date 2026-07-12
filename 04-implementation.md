# Implementation

## Introduction
This stage is where I actually built the app I designed in the previous stage, using only HTML, CSS and JavaScript like the module requires. The three files are [`index.html`](./index.html), [`style.css`](./style.css) and [`app.js`](./app.js).

## Technology and data source
The app calls the Bristol Open Data ArcGIS GeoService endpoint for the Public Toilets layer straight from the browser:

```
https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_community_and_safety/MapServer/21/query
  ?where=1=1
  &outFields=TOILET_NAME,ADDRESS,LOCALITY,OPENING_HOURS,DISABLED,BABY_CHANGE
  &f=json
```

This endpoint gives back CORS-enabled JSON, so I didn't need a server-side proxy — which fits the requirement that this stays pure client-side HTML/CSS/JS (FR1).

## Mapping requirements to code
| Requirement | Implementation |
| --- | --- |
| FR1 – get data from the API | `loadToilets()` in `app.js` calls `fetch(API_URL)`. |
| FR2 – show name/address/area/hours/accessibility/baby-change | `normaliseRecords()` turns the raw ArcGIS fields into a clean object; `renderTable()` writes each row out. |
| FR3 – filter by area | `populateAreaFilter()` builds the dropdown from the unique `LOCALITY` values in the data; `applyFilters()` filters based on whatever's selected. |
| FR4 – filter by accessibility | `applyFilters()` filters on the `disabled` or `babyChange` booleans depending which dropdown option is picked. |
| FR5 – manual refresh | The `refreshBtn` click listener just calls `loadToilets()` again. |
| FR6 – error handling with fallback | `handleLoadError()` grabs a cached copy from `localStorage` (saved every time a load succeeds) and shows it with a visible error banner; if there's no cache, it just shows the error. |
| FR7 – valid semantic HTML5 | `index.html` uses proper semantic tags (`<header>`, `<main>`, `<table>`, `<thead>`/`<tbody>`) and `scope="col"` on table headers. |

Here's the core data-loading and error-handling logic (`app.js`):

```js
async function loadToilets() {
  clearError();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API returned status " + response.status);
    const json = await response.json();
    allToilets = normaliseRecords(json);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: allToilets, savedAt: Date.now() }));
    populateAreaFilter(allToilets);
    applyFilters();
    setLastUpdated(false);
  } catch (err) {
    handleLoadError(err);
  }
}
```

## Non-functional requirements in the code
- **NFR1 (efficiency)** — I only request the six fields I actually need (`outFields=...`) instead of pulling every attribute, so the response stays small.
- **NFR3 (portability)** — `style.css` uses a CSS Grid two-column layout with a `@media (max-width: 700px)` breakpoint that collapses down to one column.
- **NFR4 (reliability)** — every successful load gets cached to `localStorage`, so if a load fails it can fall back to that instead of just showing a blank page.
- **NFR5 (maintainability)** — I split the logic into small named functions (`normaliseRecords`, `populateAreaFilter`, `renderTable`, `applyFilters`, `loadToilets`, `handleLoadError`) instead of cramming it all into one big script.
- **NFR6 (accessibility)** — the status badges use `.badge-yes` / `.badge-no` classes with colour plus font-weight (not just colour) to tell Yes/No apart, and every table header has `scope="col"` for screen readers.

## Summary
This stage got all five use cases from Requirements actually working, using plain HTML, CSS and JavaScript against the live Bristol Open Data feed. Next up is Testing, where I check this implementation against the functional and non-functional requirements.
