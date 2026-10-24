# R.S. Square Fitness Centre and R.S. Supplements

The main page is `index.html` for R.S. Square Fitness Centre. The separate shop is `supplements.html`. The owner dashboard is at `/admin-login.html`.

## Cloudflare hosting

This project is prepared for Cloudflare Pages with Pages Functions, a D1 product catalogue and gym photo gallery. An R2 bucket is optional for direct supplement packshot uploads. The gym and storefront pages stay static; the private dashboard uses Cloudflare Functions for owner sign-in and catalogue updates.

### 1. Put the project in GitHub

Create a private GitHub repository and upload the project files. The `.gitignore` keeps local data, uploaded local files, build output, and secret files out of Git. Never put owner passwords or Cloudflare secrets in the repository.

### 2. Create the Cloudflare database and optional product image bucket

Install Node.js, then in a terminal opened in the project folder run:

```powershell
npx wrangler login
npx wrangler d1 create rs-square-catalog
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0001_create_catalog.sql
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0002_seed_catalog.sql
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0003_create_gym_gallery.sql
npx wrangler d1 execute rs-square-catalog --remote --file=migrations/0004_add_product_photos.sql
```

If the D1 database already has migrations 0001–0003 applied, apply migration 0004 to add the new supplement photos. Paste its SQL contents into the database Console and execute; Cloudflare does not run SQL migrations automatically on deploy.

The seed contains the supplied catalogue: 64 product families and 80 variants. It keeps the MusclePharm entry incomplete, merges the duplicate ON Creatine variant, and keeps the Green Apple pre-workout price note for owner review.

### 3. Connect the GitHub repository to Cloudflare Pages

In Cloudflare, create a Pages project and connect the GitHub repository. Use:

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

The build copies only the public pages and assets into `dist`. The Pages Functions remain in the project’s root `functions` folder.

### 4. Connect the database, optional product images, and owner sign-in

In the Pages project, open **Settings → Bindings** and add:

- D1 database binding named `DB`, connected to `rs-square-catalog`
- Optional R2 bucket binding named `PRODUCT_IMAGES` for direct product packshot uploads. Gym gallery photos are optimized and stored in D1, so the gallery does not need R2. Product packshots can also be added by URL or by placing image files under `assets/products/`.

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
- **Products, prices, variants, and gym gallery photos:** sign in to the owner dashboard. Product changes and compressed gym gallery photos are stored in D1, so a normal website deployment does not erase them. Direct product packshot uploads use R2 only if the optional `PRODUCT_IMAGES` binding is configured; otherwise use an image URL or a file under `assets/products/`.

### Local preview

`Start-Site.cmd` still starts the original local Node server for preview on this computer. Local edits to the catalogue in its dashboard are stored in `data/products.json`; Cloudflare's live catalogue is stored separately in D1.
