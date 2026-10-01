          <WatchFolderBar
            videos={libraryVideos}
            languages={profile.targetLanguages || ["en"]}
            t={t}
            onFilter={(filtered) => {
              const currentId = queue[queueIndex]?.id;
              if (filtered.some((v) => v.id === currentId)) return;
              const loaded = profileRef.current;
              if (loaded) buildFrom(loaded, filtered);
            }}
          />
