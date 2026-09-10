export function createNavigationInbox(readURL, schedule = queueMicrotask) {
  let listener = null;
  let ready = false;
  let pending = null;
  let scheduled = false;
  let session = { userId: null, generation: 0 };

  function acknowledge(entry) {
    try { entry?.acknowledge?.(); } catch {
      // La destination reste consommée même si l'effacement natif échoue.
    }
  }

  function discard() {
    const previous = pending;
    pending = null;
    acknowledge(previous);
  }

  function flush() {
    if (scheduled || !pending || !ready || !listener) return;
    scheduled = true;
    schedule(() => {
      scheduled = false;
      if (!pending || !ready || !listener) return;
      const entry = pending;
      pending = null;
      listener(entry.url);
      acknowledge(entry);
    });
  }

  return {
    receive(value, onConsumed) {
      const destination = readURL(value);
      if (!destination) return false;
      // Pendant l'attente, le dernier choix de l'utilisateur est prioritaire.
      discard();
      pending = { url: destination.url, acknowledge: onConsumed };
      flush();
      return true;
    },
    updateSession(next) {
      const changed = session.userId !== next.userId || session.generation !== next.generation;
      if (!changed) return;
      ready = false;
      // Avant la première connexion, le nettoyage de l'état précède
      // l'installation de la session : le lien doit survivre aux deux étapes.
      // Quitter ou remplacer une session identifiée abandonne son lien.
      if (session.userId) discard();
      session = { userId: next.userId, generation: next.generation };
    },
    setReady(value) {
      ready = Boolean(value && session.userId);
      flush();
    },
    subscribe(nextListener) {
      listener = nextListener;
      flush();
      return () => { if (listener === nextListener) listener = null; };
    },
    suspend() {
      ready = false;
    },
    discard,
  };
}
