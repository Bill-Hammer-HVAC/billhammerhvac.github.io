# Hammer Heating and Air Conditioning

A fully static, accessible Astro website for Hammer Heating and Air Conditioning. It is designed for GitHub Pages at [hammerheatingandair.com](https://hammerheatingandair.com) and focuses on direct phone calls and estimate requests.

## Requirements

- Node.js 22.12 or newer (Node 24 is used in deployment)
- npm 9.6.5 or newer

## Local setup

```sh
npm install
cp .env.example .env
npm run dev
```

Add the public build settings to `.env` when you need to test the form or analytics:

```text
PUBLIC_FORMBACKEND_URL=https://www.formbackend.com/f/your-public-endpoint
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

These identifiers are emitted into static HTML. They are configuration values, not confidential server secrets. Do not put private API keys in a `PUBLIC_` variable.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Astro’s development server |
| `npm run check` | Type-check Astro, TypeScript, and content schemas |
| `npm run build` | Run checks and generate the production site in `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run the focused Playwright test suite |
| `npm run test:e2e` | Alias for the Playwright test suite |

Install Playwright’s Chromium browser once before running browser tests:

```sh
npx playwright install chromium
```

## Project structure

```text
src/
  assets/legacy/       Company-owned photos recovered from the former site
  components/          Reusable Astro UI and interactive components
  content/pages/       Long-form page copy in Markdown
  content/services/    One Markdown file per service
  content/testimonials/ One Markdown file per testimonial
  data/site.ts         Typed company and site configuration
  layouts/             Shared document layout
  pages/               Static routes
  scripts/             Typed browser analytics helper
  styles/              Global design tokens and styles
public/                CNAME, robots, favicon, and exact legacy HTML redirects
tests/                 Playwright interaction and accessibility checks
```

Content collection schemas live in `src/content.config.ts`. A check or build fails if required frontmatter is missing or malformed.

## Editing content

### Company information

Edit `src/data/site.ts` for the company name, phone, email, fax, address, service-area label, former license disclosure, Yelp link, and default SEO text. Components must consume this file instead of duplicating those facts.

### Services

Edit or add Markdown files in `src/content/services/`. Each entry requires a title, short summary, order, icon name, and optional `featured` flag. The Markdown body supplies the longer description.

Do not add a service merely because a directory listing mentions it. Confirm it with Bill first.

### Testimonials

Edit files in `src/content/testimonials/`. Keep customer wording and attribution faithful to the archived first-party site. Do not add star ratings, review totals, or unattributed marketing copy.

Testimonials can also be added from **Actions → Add testimonial → Run workflow**. Supply the customer attribution, location, optional role, complete quote, homepage-featured choice, and desired display position. The workflow:

1. Creates a safely named Markdown entry.
2. Inserts it at the requested positive order number.
3. Increments every existing testimonial at or after that position by one while preserving their relative order.
4. Runs the complete Astro check and production build.
5. Pushes a uniquely named content branch and opens a pull request against `main` for review.

The workflow requires **Settings → Actions → General → Workflow permissions** to allow read/write access and permit GitHub Actions to create pull requests. `main` is never modified directly by this workflow; merge the generated pull request after reviewing its content and order changes.

### Page copy

Home, About, and Privacy copy is stored in `src/content/pages/`. Page-specific layout remains in the corresponding Astro page.

### Images

Place real company-owned source images in `src/assets/` and import them with Astro’s `Image` component. Supply meaningful alt text, responsive widths, and dimensions. Do not hotlink or add unverified stock technician photos.

The current legacy photos were retrieved from archived copies of the company’s own website:

- `bill-hammer.jpg`: Bill Hammer beside an outdoor condenser
- `furnace-installation.jpg`: past attic installation
- `condenser-installation.jpg`: past outdoor installation

The old manufacturer-logo strip and personal sports collage were intentionally excluded. The installation gallery states that photos do not imply current brand relationships.

## FormBackend

The contact form posts directly from the browser to FormBackend; there is no server code or private form secret.

1. Create or manage the form at FormBackend.
2. Copy its full `https://www.formbackend.com/f/...` URL.
3. Set `PUBLIC_FORMBACKEND_URL` locally and as a GitHub repository variable.
4. Configure FormBackend’s notification recipient and spam settings in its dashboard.
5. Submit a real test after deployment and verify the notification arrives.

Without the variable, the site still builds and displays phone/email contact options, but the form submit button is disabled with a configuration notice. The form includes the `_honeypot` field, remains a normal HTML POST without JavaScript, and progressively adds inline status handling when JavaScript runs.

## Google Analytics 4

Set `PUBLIC_GA_MEASUREMENT_ID` to a GA4 ID beginning with `G-`. Invalid or missing values render no analytics code. The integration uses the standard asynchronous Google tag, enables no advertising features or Google Signals through custom code, and tracks:

- `phone_click` with a placement value
- `estimate_cta_click` with a placement value
- `contact_form_submit` after a successful enhanced form submission

Analytics failure never blocks links or form submission. Confirm events in GA4 DebugView or Realtime after launch; a successful build does not verify data collection.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` builds on pushes to `main` and manual dispatches. It uses npm, Node 24, the official Astro Pages action, and GitHub’s Pages deployment action.

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Set the Pages source to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions → Variables**.
4. Add `PUBLIC_FORMBACKEND_URL` with the supplied full FormBackend URL.
5. Add `PUBLIC_GA_MEASUREMENT_ID` with the supplied GA4 ID.
6. In Pages settings, set the custom domain to `hammerheatingandair.com`.
7. Run the workflow or push to `main`.
8. Confirm `CNAME`, canonical URLs, the sitemap, and all legacy paths in the deployed output.

The production build uses no repository subpath because this is an account-level `github.io` repository with a custom domain.

## Custom domain, DNS, and SSL checklist

Do not change DNS automatically. At the DNS provider:

1. Follow GitHub’s current documentation for apex-domain `A`/`AAAA` records.
2. Point `www` to the account’s GitHub Pages hostname with a `CNAME` if `www` will be supported.
3. Keep `hammerheatingandair.com` as the canonical hostname.
4. Configure the alternate `www` hostname to redirect to the apex through supported DNS/Pages configuration.
5. Wait for DNS verification in GitHub Pages settings.
6. Enable **Enforce HTTPS** when GitHub makes it available.
7. Verify both apex and `www` behavior using a private browser window and `curl -I`.
8. Confirm there are no mixed-content or certificate warnings.

DNS propagation, GitHub Pages deployment, and SSL issuance cannot be proven by a local build.

## Accessibility checklist

- Navigate every page and the mobile menu using only a keyboard.
- Confirm the skip link, visible focus rings, Escape-to-close, and focus restoration.
- Test at 200% and 400% zoom without horizontal page scrolling.
- Check 320px, tablet, and desktop layouts.
- Test with reduced motion enabled.
- Verify form labels, required messages, failure recovery, and status focus.
- Run `npm test` and review any axe violations.
- Test with at least one screen reader before launch.
- Recheck color contrast if design tokens change.

## Content verification TODOs

### Launch critical

- **Contractor status:** On July 19, 2026, the official CSLB record for license `679211` stated: “This license is canceled and not able to contract,” with cancellation requested October 19, 2023. At the owner’s direction, the public site displays only `LICENSE #679211`. Bill must confirm the present legal/business status before the site is promoted.
- Confirm that the business is currently accepting estimate requests and HVAC work.
- Confirm FormBackend notifications reach the intended monitored email address.

### Business details

- Confirm that 2230 Dufour Ave, Redondo Beach, CA 90278 should remain public and customer-facing.
- Confirm current business hours; none are published because the former site did not establish them reliably.
- Confirm exact city/service boundaries beyond the first-party “South Bay” statement.
- Reconfirm the current availability and terms of senior discounts and referrals upon request.
- Reconfirm residential and commercial availability and every migrated service category.
- Confirm whether maintenance/tune-ups or mini-split work should be added; they are currently omitted.
- Supply any official Google Business Profile, additional social links, or approved branded Open Graph image.
- Confirm whether the fax number remains monitored.

## Launch checklist

- Resolve all launch-critical verification items above.
- Run `npm ci`, `npm run check`, `npm run build`, and `npm test` from a clean checkout.
- Inspect `dist/` for `CNAME`, `robots.txt`, `sitemap-index.xml`, and exact mixed-case legacy HTML files.
- Preview the production build with the real public variables.
- Test navigation, calls, email, Yelp, native form POST, enhanced form success/failure, and analytics events.
- Run Lighthouse on representative mobile and desktop profiles and address regressions.
- Complete keyboard, screen-reader, zoom, and reflow checks.
- Review all public copy and the license display with Bill.
- Configure GitHub Pages, repository variables, custom domain, DNS, and HTTPS.

## Post-launch checklist

- Verify the apex and `www` behavior, certificate, canonical tags, robots file, and sitemap over HTTPS.
- Submit the sitemap to the relevant search consoles.
- Confirm exact legacy URLs redirect without loops.
- Send a real estimate request and confirm delivery.
- Confirm GA4 page views and conversion events without assuming immediate reporting.
- Check browser consoles and network errors on mobile and desktop.
- Monitor broken links and form spam.
- Recheck the public CSLB record before changing any license disclosure.
- Schedule periodic reviews of services, promotions, contact details, dependencies, and accessibility.

## Source notes

First-party content was recovered from Internet Archive captures of the previous site’s Home, Services, About, Testimonials, and Contact pages from 2013. That site verified the company name, phone, fax, email, South Bay statement, 1992 founding, Bill Hammer, free in-home estimates, listed services, four testimonials, senior discounts, referrals, and license number. The license status and address were checked separately against the official California Contractors State License Board record.
