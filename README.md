# makethedangmovie

A static website for indie filmmakers.

## Pages
- `index.html` – landing page
- `actors-directors.html` – actor ↔ director connections
- `producers-directors.html` – producer ↔ director connections (genre + budget filters)
- `marketplace.html` – equipment rent/sale marketplace
- `distribution.html` – movie distribution, provided by [janice.click](https://janice.click)

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Notes
- All sample profiles and listings are fictional.
- Posts, messages and film logs are stored in the browser's `localStorage` (demo mode). A backend (auth, database, payments, messaging) is the next step.
- The janice.click integration currently links out to https://janice.click; wire in their API or embed once details are available.
