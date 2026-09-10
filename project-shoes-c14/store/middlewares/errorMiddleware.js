import { isRejectedWithValue } from "@reduxjs/toolkit";
import { userApi } from "../api/userApi";
import { setErrorHttp } from "../slices/errorSlice";

export const rtkQueryErrorMiddleware = (api) => (next) => (action) => {
  const result = next(action);
  const isProfileRead = userApi.endpoints.getUserById.matchRejected(action);
  const isProfileWrite = userApi.endpoints.updateUser.matchRejected(action);

  if ((isProfileRead || isProfileWrite) && isRejectedWithValue(action)) {
    const argument = action.meta.arg.originalArgs;
    const requestUserId = isProfileRead ? argument : argument?.id;
    const currentUserId = api.getState().user.id;
    if (currentUserId && requestUserId === currentUserId) {
      api.dispatch(setErrorHttp(true));
    }
  }
  return result;
};
