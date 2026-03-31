const KEY = "srm_bookmarks_v1";

/** @type {{ label: string, screen: string }[]} */
const DEFAULT_BOOKMARKS = [
  { label: "Business Registration", screen: "business-reg" },
  { label: "Quotation", screen: "quotation" },
];

function safeParse(raw) {
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return null;
    return v.filter(b => b && typeof b.label === "string" && typeof b.screen === "string");
  } catch {
    return null;
  }
}

export function loadBookmarksFromStorage() {
  if (typeof localStorage === "undefined") return [...DEFAULT_BOOKMARKS];
  const parsed = safeParse(localStorage.getItem(KEY));
  if (parsed && parsed.length > 0) return parsed;
  return [...DEFAULT_BOOKMARKS];
}

/** @param {{ label: string, screen: string }[]} bookmarks */
export function saveBookmarksToStorage(bookmarks) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(bookmarks));
}
