const KEY = "safetube-parent-unlock";

export function markParentSignedIn() {
  try {
    sessionStorage.setItem(KEY, "1");
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearParentSignedIn() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function isParentSignedIn() {
  try {
    return sessionStorage.getItem(KEY) === "1" || localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
