// Export / Import settings — manual cross-device transfer of everything stored locally.
import { useState } from "react";
import { Download, Upload, Loader2, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { exportBackup, importBackup } from "@/adapters/localDb";
import { applyAppLanguage } from "@/lib/language";
import { sealBackup, openBackup } from "@/lib/backupCrypto";
import { wipeDeviceData } from "@/lib/devicePrivacy";

export default function BackupPanel() {
  const { t } = useI18n();
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const doExport = async () => {
    setBusy(true);
    try {
      const backup = await sealBackup(await exportBackup(), passphrase.trim());
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `safetube-kids-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice({ type: "ok", key: "backup.exportOk" });
    } catch {
      setNotice({ type: "error", key: "backup.exportError" });
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const parsed = JSON.parse(await file.text());
      const json = await openBackup(parsed, passphrase.trim());
      await importBackup(json);
      if (typeof json.languagePreference === "string" && /^[a-z]{2}$/.test(json.languagePreference)) {
        applyAppLanguage(json.languagePreference);
      }
      setNotice({ type: "ok", key: "backup.importOk" });
      window.dispatchEvent(new CustomEvent("safetube:data-changed"));
    } catch {
      setNotice({ type: "error", key: "backup.importError" });
    } finally {
      setBusy(false);
    }
  };

  const doWipe = async () => {
    if (!window.confirm("Delete all SafeTube data on this device? This does not delete the parent account.")) return;
    await wipeDeviceData();
    window.location.assign("/");
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">{t("backup.title")}</h2>
      <p className="text-sm text-muted-foreground">{t("backup.text")}</p>
      <p className="text-sm text-muted-foreground">Child profiles stay on this device. A passphrase encrypts the backup file. Leave it empty to keep the current plain file.</p>
      <input
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Optional backup passphrase"
        className="h-12 w-full max-w-md rounded-xl border border-input bg-background px-4"
        autoComplete="new-password"
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={doExport} disabled={busy} className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} {t("backup.export")}
        </button>
        <label className="flex h-14 cursor-pointer items-center gap-2 rounded-2xl border-2 border-border px-6 font-semibold">
          <Upload className="h-5 w-5" /> {t("backup.import")}
          <input type="file" accept="application/json" className="hidden" onChange={(e) => doImport(e.target.files?.[0])} />
        </label>
        <button type="button" onClick={doWipe} className="flex h-14 items-center gap-2 rounded-2xl border-2 border-destructive/40 px-6 font-semibold text-destructive">
          <Trash2 className="h-5 w-5" /> Wipe this device
        </button>
      </div>
      {notice && (
        <p className={`text-sm font-medium ${notice.type === "error" ? "text-destructive" : "text-primary"}`}>{t(notice.key)}</p>
      )}
    </div>
  );
}
