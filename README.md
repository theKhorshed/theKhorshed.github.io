# khorshed.dev

Personal site, a single static page built with Tailwind CSS v4 and deployed to GitHub Pages.

## Development

```sh
npm install
npm run dev     # rebuilds public/assets/app.css on change
npm run serve   # http://localhost:8000
```

Everything served lives in `public/`. `npm run build` writes the minified CSS, and the
GitHub Actions workflow publishes `public/` on every push to `master`.

## Contact form

The form posts to [Web3Forms](https://web3forms.com). Replace `YOUR_WEB3FORMS_ACCESS_KEY`
in `public/index.html` with the access key for your inbox.
