# Image Inventory

Current local image root: `apps/web/public`

Planned object storage shape: RustFS/S3-compatible bucket named `tastingswithtay` with stable CDN
URLs or app-proxied paths. Suggested key folders are `about/`, `recipes/`, `wines/`,
`experiments/`, `gallery/`, `brand/`, and `system/`.

## Broken References Found

| Current reference                                         | Status                                        | Suggested replacement                                     |
| --------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| `/beautiful-kitchen-scene-with-ingredients-and-cooki.jpg` | Missing from `public`                         | `/elegant-kitchen-scene-with-fresh-ingredients-and-s.jpg` |
| `/overhead-shot-of-colorful-ingredients-on-cutting-.jpg`  | Missing from `public`                         | `/colorful-fresh-ingredients-arranged-beautifully-on.jpg` |
| `/icon-192.png`                                           | Missing from `public`; referenced by manifest | Generate/store a real 192x192 app icon                    |
| `/icon-512.png`                                           | Missing from `public`; referenced by manifest | Generate/store a real 512x512 app icon                    |

## Referenced Assets

| Asset                                                     | Current role                                    | Suggested RustFS key                        |
| --------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| `apple-icon.png`                                          | Apple touch icon                                | `system/apple-icon-256.png`                 |
| `icon-light-32x32.png`                                    | Light-mode favicon                              | `system/favicon-light-32.png`               |
| `icon-dark-32x32.png`                                     | Dark-mode favicon                               | `system/favicon-dark-32.png`                |
| `logo-light.png`                                          | Light-mode brand wordmark                       | `brand/logo-light.png`                      |
| `logo-dark.png`                                           | Dark-mode brand wordmark                        | `brand/logo-dark.png`                       |
| `avatar-light.png`                                        | Light-mode brand avatar                         | `brand/avatar-light.png`                    |
| `avatar-dark.png`                                         | Dark-mode brand avatar                          | `brand/avatar-dark.png`                     |
| `warm-portrait-of-woman-cooking-in-bright-kitchen-n.jpg`  | About hero placeholder; replace with wife photo | `about/tay-portrait.jpg`                    |
| `elegant-kitchen-scene-with-fresh-ingredients-and-s.jpg`  | About quote/image break                         | `about/kitchen-scene.jpg`                   |
| `colorful-fresh-ingredients-arranged-beautifully-on.jpg`  | About ingredients image                         | `about/fresh-ingredients.jpg`               |
| `artisan-sourdough-bread-loaf-with-crispy-golden-cr.jpg`  | Login image and seeded sourdough recipe         | `recipes/rustic-sourdough-bread/hero.jpg`   |
| `elegant-red-wine-glass-with-bordeaux-on-white-linen.jpg` | Signup image and seeded Bordeaux wine           | `wines/chateau-margaux-2018/hero.jpg`       |
| `honey-glazed-salmon-with-colorful-roasted-vegetabl.jpg`  | Seeded salmon recipe                            | `recipes/honey-glazed-salmon/hero.jpg`      |
| `fresh-spring-pasta-with-green-vegetables-herbs-and.jpg`  | Seeded pasta recipe                             | `recipes/spring-garden-pasta/hero.jpg`      |
| `perfect-french-omelette-on-white-plate-with-herbs.jpg`   | Seeded omelette recipe                          | `recipes/classic-french-omelette/hero.jpg`  |
| `golden-roast-chicken-with-herbs-and-lemon-slices.jpg`    | Seeded roast chicken recipe                     | `recipes/lemon-herb-roast-chicken/hero.jpg` |
| `chocolate-lava-cake-with-molten-center-on-plate.jpg`     | Seeded lava cake recipe                         | `recipes/chocolate-lava-cakes/hero.jpg`     |
| `crisp-white-wine-glass-with-vineyard-background.jpg`     | Seeded Sauvignon Blanc wine                     | `wines/cloudy-bay-sauvignon-2023/hero.jpg`  |
| `rose-wine-glass-with-summer-light-setting.jpg`           | Seeded rose wine                                | `wines/whispering-angel-rose-2023/hero.jpg` |
| `champagne-flute-with-golden-bubbles-celebration.jpg`     | Seeded Champagne wine                           | `wines/dom-perignon-2012/hero.jpg`          |
| `napa-valley-red-wine-with-vineyard-sunset.jpg`           | Seeded Caymus wine                              | `wines/caymus-cabernet-2021/hero.jpg`       |
| `german-riesling-wine-glass-mosel-valley.jpg`             | Seeded Riesling wine                            | `wines/riesling-spatlese-2022/hero.jpg`     |

## Unreferenced Local Assets

These are tracked locally but not currently referenced by source or seed data.

| Asset                                                    | Suggested role                   | Suggested RustFS key                            |
| -------------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| `beautiful-dinner-plate-with-steak-and-vegetables.jpg`   | Future recipe hero               | `recipes/future/steak-and-vegetables.jpg`       |
| `beautiful-olive-wood-cutting-board-with-grain.jpg`      | Shop or kitchen essentials image | `uploads/olive-wood-cutting-board.jpg`          |
| `elegant-breakfast-spread-with-pastries-and-coffee.jpg`  | Future breakfast/hosting content | `uploads/breakfast-spread.jpg`                  |
| `elegant-cream-ceramic-mixing-bowls-stacked-kitchen.jpg` | Shop or baking content           | `uploads/ceramic-mixing-bowls.jpg`              |
| `fresh-baked-goods-cookies-and-bread-on-cooling-rac.jpg` | Future baking content            | `uploads/baked-goods.jpg`                       |
| `natural-linen-kitchen-towels-folded-neatly.jpg`         | Shop or essentials content       | `uploads/linen-kitchen-towels.jpg`              |
| `seasonal-harvest-vegetables-and-fruits-arrangement.jpg` | Garden/seasonal content          | `gallery/seasonal-harvest.jpg`                  |
| `placeholder.jpg`                                        | Generic raster placeholder       | `system/placeholder.jpg`                        |
| `placeholder.svg`                                        | Generic SVG placeholder          | Keep local or store as `system/placeholder.svg` |
| `placeholder-user.jpg`                                   | Generic user avatar fallback     | `system/placeholder-user.jpg`                   |

## Admin Upload Direction

Use the `dsqr-dotdev` pattern as the starting point:

- Server-only S3/RustFS client with `S3_ENDPOINT`, `S3_BUCKET=tastingswithtay`, `S3_ACCESS_KEY`,
  `S3_SECRET_KEY`, `S3_REGION`, and path-style requests.
- Runtime config should also include `S3_USE_SSL`, `S3_FORCE_PATH_STYLE`, and `CDN_BASE`.
  Current intended endpoint/CDN are `s3.dsqr.dev` and `https://cdn.dsqr.dev`.
- Keep `S3_ACCESS_KEY` and `S3_SECRET_KEY` out of source control. Store them only in local/env
  config for the deployment target.
- Admin mutation validates the user is admin, accepts an image upload, validates content type and
  size, writes to RustFS, then stores the returned app URL in the database field.
- Public pages read stored image URLs only. Prefer app-proxied URLs such as
  `/api/assets/...` if the bucket should remain private, or `CDN_BASE` URLs if the object prefix is
  public through the CDN.
