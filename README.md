# Amanda's Goodies

Website for Amanda's home bakery, hosted on GitHub Pages.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy on GitHub Pages

1. Push to the `main` branch on GitHub.
2. Repo **Settings → Pages → Source**: select **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Site will be live at `https://<username>.github.io/Amandas-Goodies/`.

## To do

- Replace placeholder SVGs in `images/` with real product photos (keep the same filenames, or update the `<img src>` paths in `index.html`).
- Drop the Google Form embed into `index.html` where the `<!-- TODO: Replace the .form-placeholder ... -->` comment lives, then delete the placeholder card.
