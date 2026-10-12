# AP STORE

A static, Play Store style app store. Apps come from a Google Sheet, so you never edit code to add an app.

## Files

| File | What it does |
|---|---|
| `index.html` | The page shell |
| `css/theme.css` | Light and dark colours |
| `css/layout.css` | Header, navigation, footer |
| `css/components.css` | Cards, hero, download button, reviews, popups |
| `js/config.js` | **All your settings** (sheet, ads, reviews, Telegram links, tagline) |
| `js/data.js` | Reads the Google Sheet |
| `js/pages.js` | Home, categories, search, app page |
| `js/install.js` | Play Store style download button |
| `js/main.js` | Routing, search, theme, popups |
| `manifest.json`, `sw.js` | Makes the site installable and fast (PWA) |
| `assets/` | Logo and icons |

## 1. Put it on GitHub Pages
1. Create a repo and upload everything in this folder, keeping the folders as they are.
2. Settings, Pages, Source: Deploy from a branch, `main`, `/ (root)`, Save.
3. Your site opens at `https://USERNAME.github.io/REPO/`.

To preview the design before connecting your sheet, open the site with `?demo` at the end of the link.

## 2. Google Sheet
Share the sheet as "Anyone with the link: Viewer". Row 1 must contain these column names:

`id, title, category, description, image, downloadurl, rating, downloads, views, size, version, updated`

Optional columns: `developer, screenshots, whatsnew, featured, status`

- `screenshots`: image links separated by commas
- `featured`: `yes` puts the app in the top carousel and marks it Editor's choice
- `status`: `hidden` removes the app from the site
- `downloadurl`: a direct link. Google Drive file links are converted to direct downloads automatically
- `updated`: dates like `23-09-2026`. Apps updated in the last 14 days get a New badge

Add a row and the app appears on the site right away.

## 3. Ads
Open `js/config.js` and paste your ad code into `ads.top`, `ads.inline`, `ads.detail` and `ads.footer` (inside backticks). Set `placeholders: false` when you are done.

## 4. Reviews with Google Forms
1. Create a Google Form with four short-answer questions: App ID, Name, Rating, Comment.
2. In the form menu choose "Get pre-filled link", type anything in each field, click Get link and copy it. It contains `entry.123456789` style IDs.
3. In `js/config.js` set `formAction` to the form's link, ending in `/formResponse`, and put the four entry IDs under `fields`.
4. Open the form's Responses, link it to a Sheet, then File, Share, Publish to web, choose CSV. Paste that link into `responsesCsv`.

The Responses sheet columns must stay in this order: Timestamp, App ID, Name, Rating, Comment.

## Notes
- The download button starts the real download from `downloadurl` immediately. The progress bar is a visual indicator only, because browsers cannot report progress for downloads opened in a new tab.
- Only list apps you have the right to distribute.
