  const current = queue[queueIndex];
  if (!current || !matchesLanguage(current, watchLanguage)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex max-w-5xl items-center justify-between p-4 sm:p-6">
          <Link to="/" className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-medium hover:bg-accent"><ArrowLeft className="h-5 w-5" /> {t("common.profiles")}</Link>
          <LanguageSwitch languages={languages} value={watchLanguage} onChange={chooseLanguage} />
        </header>
        <main className="mx-auto max-w-5xl space-y-4 px-4">
          <WatchFolderBar videos={libraryVideos} ageGroup={profile.ageGroup} languages={languages} instructionLanguage={watchLanguage} readingLevel={profile.readingLevel || "letters"} t={t} onFilter={(filtered) => { const matched = filtered.filter((video) => matchesLanguage(video, watchLanguage)); if (matched.length) buildFrom(profile, matched); }} />
          <p className="text-sm text-muted-foreground">Lessons in {watchLanguage.toUpperCase()} will load over time. A lesson in another language will not play.</p>
        </main>
      </div>
    );
  }
