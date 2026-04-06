/**
 * Media data for the 2026 Natick CNY Gala post-event page.
 *
 * TO UPDATE:
 * - Add/replace YouTube video IDs in `VIDEOS` array.
 * - Add/replace Google Drive file IDs in `DRIVE_IMAGE_IDS` array.
 *   (Extract from share links: drive.google.com/file/d/FILE_ID/view)
 */

export interface VideoEntry {
  id: string;        // YouTube video ID
  title: string;     // Display title
  placeholder?: boolean;
}

// ── YouTube Videos ───────────────────────────────────────────────────────────
// Replace placeholder IDs with your actual YouTube video IDs.
export const VIDEOS: VideoEntry[] = [
  { id: 'RU-e4gMOheg', title: '2026 春晚精彩片段 · Gala Highlights' },
  { id: 'RU-e4gMOheg', title: '开场节目 · Opening Performance', placeholder: true },
  { id: 'RU-e4gMOheg', title: '舞狮表演 · Lion Dance', placeholder: true },
  { id: 'RU-e4gMOheg', title: '古典舞 · Classical Dance', placeholder: true },
  { id: 'RU-e4gMOheg', title: '武术表演 · Martial Arts', placeholder: true },
  { id: 'RU-e4gMOheg', title: '少儿歌舞 · Children\'s Choir', placeholder: true },
  { id: 'RU-e4gMOheg', title: '声乐表演 · Vocal Performance', placeholder: true },
  { id: 'RU-e4gMOheg', title: '现代舞 · Contemporary Dance', placeholder: true },
  { id: 'RU-e4gMOheg', title: '传统乐器 · Traditional Instruments', placeholder: true },
  { id: 'RU-e4gMOheg', title: '诗朗诵 · Poetry Recitation', placeholder: true },
  { id: 'RU-e4gMOheg', title: '魔术表演 · Magic Show', placeholder: true },
  { id: 'RU-e4gMOheg', title: '压轴节目 · Grand Finale', placeholder: true },
  { id: 'RU-e4gMOheg', title: '闭幕式 · Closing Ceremony', placeholder: true },
  { id: 'RU-e4gMOheg', title: '花絮 · Behind the Scenes', placeholder: true },
];

// ── Google Drive Images ───────────────────────────────────────────────────────
// Extract IDs from share links: drive.google.com/file/d/FILE_ID/view
// Replace placeholders with your actual file IDs.
export const DRIVE_IMAGE_IDS: string[] = [
  '1io3NSNaC00RKTemHN4YtrpVmaT-yOII_', // real — provided sample
  // Add more IDs here:
  // 'REPLACE_ME_1',
  // 'REPLACE_ME_2',
  // ...
];

// Converts a Drive file ID to a direct embeddable image URL.
// Uses Google Drive's thumbnail API which supports cross-origin embedding.
// sz=w1200 requests up to 1200px wide — reduces download size vs. full-res.
export const driveImageUrl = (fileId: string): string =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;

// The full album is opened via the button. URL intentionally not surfaced as
// visible text in any UI element — only used as an href target.
export const GALLERY_HREF = 'https://drive.google.com/drive/folders/106rSFwDMe8S2tur1Rd8BInk0XSjvaY1E?usp=drive_link';
