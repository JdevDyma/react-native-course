export function startLinkReception({ linking, notifications, inbox, seenResponses,
  notificationsSupported, initialWaitMs = 1500 }) {
  let active = true;
  let liveEvents = 0;
  let notificationSubscription = null;
  let initialTimer = null;

  function lastResponse() {
    if (!notificationsSupported) return null;
    try { return notifications.getLastNotificationResponse(); } catch { return null; }
  }

  function responseKey(response) {
    const identifier = response?.notification?.request?.identifier;
    if (response?.actionIdentifier !== notifications.DEFAULT_ACTION_IDENTIFIER ||
        typeof identifier !== "string" || !identifier || identifier.length > 256) return null;
    return identifier;
  }

  function receiveResponse(response) {
    if (!active) return;
    const key = responseKey(response);
    if (!key || seenResponses.has(key)) return;
    const url = response.notification.request.content?.data?.url;
    const accepted = inbox.receive(url, () => {
      // Une réponse plus récente ne doit pas être effacée à la place de celle-ci.
      if (responseKey(lastResponse()) === key) notifications.clearLastNotificationResponse();
    });
    if (!accepted) return;
    seenResponses.add(key);
    if (seenResponses.size > 128) seenResponses.delete(seenResponses.values().next().value);
  }

  const linkSubscription = linking.addEventListener("url", ({ url }) => {
    if (!active) return;
    liveEvents += 1;
    inbox.receive(url);
  });
  if (notificationsSupported) {
    try {
      notificationSubscription = notifications.addNotificationResponseReceivedListener(response => {
        if (!active) return;
        liveEvents += 1;
        receiveResponse(response);
      });
    } catch {
      // Les liens restent utilisables si les notifications sont indisponibles.
    }
  }
  const initialResponse = lastResponse();
  let initialFinished = false;
  function finishInitial(url) {
    if (initialFinished) return;
    initialFinished = true;
    clearTimeout(initialTimer);
    if (!active || liveEvents) return;
    // Un lien explicite de lancement prime sur une ancienne réponse conservée.
    if (typeof url === "string" && url) {
      inbox.receive(url);
      return;
    }
    receiveResponse(initialResponse);
  }
  initialTimer = setTimeout(() => finishInitial(null), initialWaitMs);
  try {
    Promise.resolve(linking.getInitialURL()).then(finishInitial, () => finishInitial(null));
  } catch {
    finishInitial(null);
  }

  return () => {
    active = false;
    clearTimeout(initialTimer);
    linkSubscription.remove();
    notificationSubscription?.remove();
    inbox.suspend();
  };
}
