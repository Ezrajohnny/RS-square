# R.S. Square Fitness Centre and R.S. Supplements

The main page is `index.html` for R.S. Square Fitness Centre. The separate shop is `supplements.html`. The owner dashboard is at `/admin-login.html`.

## Cloudflare hosting

This project is prepared for Cloudflare Pages with Pages Functions, a D1 product catalogue, and an R2 bucket for product images. The gym and storefront pages stay static; the private dashboard uses Cloudflare Functions for owner sign-in and catalogue updates.

### 1. Put the project in GitHub

Create a private GitHub repository and upload the project files. The `.gitignore` keeps local data, uploaded local files, build output, and secret files out of Git. Never put owner passwords or Cloudflare secrets in the repository.

### 2. Create the Cloudflare database and image bucket

Install Node.js, then in a terminal opened in the project folder run:

```powershell
npx wrangler login
npx wrangler d1 create rs-square-catalog
npx wrangler r2 bucket create rs-square-product-images
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0001_create_catalog.sql
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0002_seed_catalog.sql
```

The seed contains the supplied catalogue: 64 product families and 80 variants. It keeps the MusclePharm entry incomplete, merges the duplicate ON Creatine variant, and keeps the Green Apple pre-workout price note for owner review.

### 3. Connect the GitHub repository to Cloudflare Pages

In Cloudflare, create a Pages project and connect the GitHub repository. Use:

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

The build copies only the public pages and assets into `dist`. The Pages Functions remain in the project’s root `functions` folder.

### 4. Connect the database, images, and owner sign-in

In the Pages project, open **Settings → Bindings** and add:

- D1 database binding named `DB`, connected to `rs-square-catalog`
- R2 bucket binding named `PRODUCT_IMAGES`, connected to `rs-square-product-images`

In **Settings → Variables and Secrets**, add these as secrets for production:

- `ADMIN_USERNAME`: the owner's chosen sign-in name
- `ADMIN_PASSWORD`: the owner's private password (use at least 12 characters)
- `SESSION_SECRET`: a separate random secret with at least 32 characters

For example, generate a random session secret in PowerShell with:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Save the secrets, then trigger a new deployment so the bindings and secrets take effect. Open `/admin-login.html` on the published site to sign in. Only visitors with the configured owner credentials can open the dashboard or change products.

### After launch

- **Website design/content:** edit the files in the project, commit and push to GitHub. Cloudflare Pages will build and publish the update.
- **Products, prices, variants, and packshot images:** sign in to the owner dashboard. Product changes are saved in D1 and uploaded images in R2, so a normal website deployment does not erase them.

### Local preview

`Start-Site.cmd` still starts the original local Node server for preview on this computer. Local edits to the catalogue in its dashboard are stored in `data/products.json`; Cloudflare's live catalogue is stored separately in D1.
