/* ===================================================================
   AP STORE settings. Change things here, nowhere else.
   =================================================================== */
const CONFIG = {
  brand: {
    name: 'AP STORE',
    founder: 'AP STUDY MODS',
    tagline: 'Your next favorite app, one tap away.'
  },

  // Google Sheet that holds your apps.
  // Share it as "Anyone with the link: Viewer". gid is only needed for a tab other than the first.
  sheet: {
    id: '162a9lnAZ_LqGK-OkGTdPkBIGfUjVZQvLsHYzS0qodJA',
    gid: ''
  },

  // Reviews through a Google Form (see README.md for the steps)
  reviews: {
    formAction: '',    // https://docs.google.com/forms/d/e/XXXX/formResponse
    fields: { app: '', name: '', rating: '', comment: '' },   // entry.123456789 ...
    responsesCsv: ''   // published CSV link of the form's responses sheet
  },

  // Paste your ad code (AdSense, Adsterra, etc.) between the quotes.
  // Set placeholders to false when you are done.
  ads: { top: '', inline: '', detail: '', footer: '', placeholders: true },

  telegram: [
    { n: 'AP STUDY MODS',        d: 'Main channel',         u: 'https://t.me/apstudymods' },
    { n: 'AP STUDY MODS [GROUP]', d: 'Community group',      u: 'https://t.me/apstudymodsgroup' },
    { n: 'ULTIMATE APK MODS',    d: 'APK channel',          u: 'https://t.me/ultimateapkmods' },
    { n: 'Edit Vault Resources', d: 'Editing resources',    u: 'https://t.me/editvaultresources' }
  ],

  newDays: 14,          // apps updated within this many days get a "New" badge
  showSplash: true      // logo splash screen once per visit
};
