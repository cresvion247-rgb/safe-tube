// Export / Import settings — manual cross-device transfer of everything stored locally.
import { useState } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { exportBackup, importBackup } from "@/adapters/localDb";
import { applyAppLanguage } from "@/lib/language";

export default function BackupPanel() {
  const { t } = useI18n();
  const [notice, setNotice] = useState(null); // { type, key }
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setBusy(true);
    try {
      const backup = await exportBackup();
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
      const json = JSON.parse(await file.text());
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

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">{t("backup.title")}</h2>
      <p className="text-sm text-muted-foreground">{t("backup.text")}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={doExport}
          disabled={busy}
          className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} {t("backup.export")}
        </button>
        <label className="flex h-14 cursor-pointer items-center gap-2 rounded-2xl border-2 border-border px-6 font-semibold">
          <Upload className="h-5 w-5" /> {t("backup.import")}
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => doImport(e.target.files?.[0])}
          />
        </label>
      </div>
      {notice && (
        <p className={`text-sm font-medium ${notice.type === "error" ? "text-destructive" : "text-primary"}`}>
          {t(notice.key)}
        </p>
      )}
    </div>
  );
}