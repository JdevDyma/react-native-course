import { isRejectedWithValue } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import { showHttpError } from "../slices/errorSlice";
import { toAuthMessages } from "../../lib/authErrors";

export const rtkQueryErrorMiddleware = (api) => (next) => (action) => {
  const result = next(action);
  if (!isRejectedWithValue(action) || action.meta?.aborted) return result;
  const authFailure = authApi.endpoints.sign.matchRejected(action);
  const profileFailure = userApi.endpoints.createUser.matchRejected(action);
  if (!authFailure && !profileFailure) return result;
  const generation = action.meta?.arg?.originalArgs?.generation;
  if (!Number.isSafeInteger(generation) || api.getState().auth.generation !== generation) return result;
  const message = authFailure ? toAuthMessages(action.payload).auth :
    action.payload?.code === "SESSION_EXPIRED" ? "Reconnectez-vous pour terminer la création du profil." :
      "Le compte existe, mais le profil n’a pas été confirmé. Reprenez sa création ou annulez.";
  api.dispatch(showHttpError(message));
  return result;
};
