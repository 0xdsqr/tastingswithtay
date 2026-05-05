# Image Inventory

The public app no longer ships stock or placeholder image files from `apps/web/public`.
Main content images are managed through the admin portal and written to the RustFS/S3-compatible
bucket named `tastingswithtay`.

## Storage

- Bucket: `tastingswithtay`
- Endpoint: `s3.dsqr.dev`
- CDN base: `https://cdn.dsqr.dev`
- Suggested folders: `about/`, `recipes/`, `wines/`, `experiments/`, `gallery/`, `brand/`,
  `system/`, and `uploads/`

Secrets stay in local/deployment env only. Do not commit `S3_ACCESS_KEY`, `S3_SECRET_KEY`,
`DATABASE_URL`, or `AUTH_SECRET`.

## Managed Image Fields

| Admin area     | Field                  | Suggested RustFS folder | Notes                                                 |
| -------------- | ---------------------- | ----------------------- | ----------------------------------------------------- |
| Site > About   | About hero image       | `about/`                | Tay's main portrait; upload directly from this field. |
| Site > About   | Quote image            | `about/`                | Wide kitchen/process image behind the quote section.  |
| Site > About   | What you'll find image | `about/`                | Square supporting About page image.                   |
| Recipes        | Hero image             | `recipes/`              | Required before publishing through admin.             |
| Wines          | Image                  | `wines/`                | Required before publishing through admin.             |
| Test Kitchen   | Hero image             | `experiments/`          | Required before publishing through admin.             |
| Test Kitchen   | Entry images           | `experiments/`          | One managed image URL per line.                       |
| Garden & Flock | Image                  | `gallery/`              | Required before publishing through admin.             |
| Images tab     | General uploads        | Any managed folder      | Upload, preview, copy URL, or delete from RustFS.     |

## Admin Status

Admin image fields show:

- Green: the value is a managed RustFS/CDN URL.
- Red: the field is empty or still points at an old bundled public image path.

Publishing recipes, wines, experiments, and gallery items through admin requires managed image URLs.
Drafts can stay missing while content is being prepared.
