import * as ScreenOrientation from "expo-screen-orientation";

let queue = Promise.resolve();
let latestIntent = 0;

export function requestPhotoOrientation(photoOpen) {
  const intent = ++latestIntent;
  const operation = queue.then(async () => {
    if (intent !== latestIntent) return { obsolete: true, error: "" };
    try {
      if (photoOpen) await ScreenOrientation.unlockAsync();
      else await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      return { obsolete: intent !== latestIntent, error: "" };
    } catch {
      return {
        obsolete: intent !== latestIntent,
        error: photoOpen
          ? "La rotation n’a pas pu être autorisée. La photo reste consultable."
          : "Le retour en portrait n’a pas abouti. Vous pouvez réessayer.",
      };
    }
  });
  queue = operation.then(() => undefined);
  return operation;
}
