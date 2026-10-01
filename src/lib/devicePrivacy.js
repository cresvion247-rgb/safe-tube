// Clears child data on this device only. Does not delete the Supabase parent account.
export async function wipeDeviceData() {
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase("safetube_kids");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
  try {
    localStorage.removeItem("safetube-auth");
    localStorage.removeItem("safetube_parent_signed_in");
  } catch {
    /* ignore */
  }
}
