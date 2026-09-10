import { isRejectedWithValue } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import { showHttpError } from "../slices/errorSlice";

export const rtkQueryErrorMiddleware = (api) => (next) => (action) => {
  const result = next(action);
  if (!isRejectedWithValue(action) || action.meta?.aborted) return result;
  const profileFailure = userApi.endpoints.createUser.matchRejected(action);
  if (!profileFailure) return result;
  const generation = action.meta?.arg?.originalArgs?.generation;
  if (!Number.isSafeInteger(generation) || api.getState().auth.generation !== generation) return result;
  const message = action.payload?.code === "SESSION_EXPIRED" ? "Reconnectez-vous pour terminer la création du profil." :
      "Le compte existe, mais le profil n’a pas été confirmé. Reprenez sa création ou annulez.";
  api.dispatch(showHttpError(message));
  return result;
};
