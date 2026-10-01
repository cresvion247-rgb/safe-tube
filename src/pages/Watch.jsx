  if ((phase === "empty" || (queue[queueIndex] && !matchesLanguage(queue[queueIndex], watchLanguage))) && profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background pt-safe">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4 sm:p-6">
            <Link to="/" className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-medium hover:bg-accent"><ArrowLeft className="h-5 w-5" /> {t("common.profiles")}</Link>
            <LanguageSwitch languages={languages} value={watchLanguage} onChange={chooseLanguage} />
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-4 px-4 py-4">
          <WatchFolderBar videos={libraryVideos} ageGroup={profile.ageGroup} languages={languages} instructionLanguage={watchLanguage} readingLevel={profile.readingLevel || "letters"} t={t} onFilter={(filtered) => { const matched = filtered.filter((video) => matchesLanguage(video, watchLanguage)); if (matched.length) buildFrom(profile, matched); }} />
          <div className="grid aspect-video w-full place-items-center rounded-3xl border border-border bg-card p-8 text-center">
            <div className="space-y-2">
              <p className="font-heading text-2xl font-bold">Player ready</p>
              <p className="text-muted-foreground">A {watchLanguage.toUpperCase()} lesson will appear here. A lesson in another language will not play.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
