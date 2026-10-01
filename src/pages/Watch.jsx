  const buildFrom = async (loaded, videos, language = watchLanguage) => {
    const watchedIds = new Set(await getWatchedVideoIds(profileId));
    const pool = videos.filter((video) => video.language === language);
    let candidates = pool.filter((v) => !watchedIds.has(v.id));
    if (!candidates.length) {
      await clearWatchedHistory(profileId);
      candidates = pool;
    }
    if (!candidates.length) {
      setQueue([]);
      setPhase("empty");
      return;
    }
    const { queue: built } = makeQueue(candidates, loaded.educationalTokens, loaded.comprehensionScore, loaded.ageGroup);
    setQueue(built);
    setQueueIndex(0);
    if (built[0]?.category === ENTERTAINMENT_CATEGORY) await spendTokens(built[0], entertainmentCostFor(loaded.ageGroup), loaded);
    setPhase(secondsRef.current >= (loaded.dailyTimeLimitMinutes ?? 60) * 60 ? "timelock" : "ready");
  };
