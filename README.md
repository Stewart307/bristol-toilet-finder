# bristol-toilet-finder

A web app that shows real-time public toilet information across Bristol using the Bristol Open Data / ArcGIS API. Shows each toilet's name, address, area and opening hours, and lets you filter by area or by accessibility (wheelchair access / baby changing).

Dataset: https://opendata.bristol.gov.uk/datasets/bcc::public-toilets

- [Planning](01-planning.md)
- [Requirements](02-requirements.md)
- [Design](03-design.md)
- [Implementation](04-implementation.md)
- [Testing](05-testing.md)

## Running locally
This is a static site with no build step or backend.


Then open `https://stewart307.github.io/bristol-toilet-finder/`. The app calls the Bristol Open Data ArcGIS endpoint directly from the browser, so an internet connection is needed to see live data.
