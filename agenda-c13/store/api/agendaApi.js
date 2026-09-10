import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../lib/config";

async function firebaseBaseQuery(args, api, extraOptions) {
  try {
    const baseQuery = fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 });
    return await baseQuery(args, api, extraOptions);
  } catch {
    return { error: { status: "CUSTOM_ERROR", error: "Configuration réseau invalide." } };
  }
}

export const agendaApi = createApi({
  reducerPath: "agendaApi",
  baseQuery: firebaseBaseQuery,
  tagTypes: ["Events"],
  endpoints: (builder) => ({
    getAllEvents: builder.query({
      query: () => ({
        url: "events.json",
        validateStatus: (response, body) => response.ok &&
          (body === null || (typeof body === "object" && !Array.isArray(body))),
      }),
      transformResponse: (response) => Object.entries(response ?? {})
        .map(([key, value]) => ({ ...value, id: key }))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
      transformErrorResponse: () => "Impossible de charger les événements.",
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation({
      query: ({ id, ...event }) => ({
        url: "events.json", method: "POST", body: event,
        validateStatus: (response, body) => response.ok &&
          typeof body?.name === "string" && body.name.trim().length > 0,
      }),
      invalidatesTags: (result, error) => error ? [] : ["Events"],
    }),
    updateEvent: builder.mutation({
      queryFn: ({ id, ...event }, api, extraOptions, baseQuery) => {
        if (typeof id !== "string" || !id.trim()) {
          return { error: { status: "CUSTOM_ERROR", error: "Identifiant d’événement absent." } };
        }
        return baseQuery({
          url: `events/${encodeURIComponent(id)}.json`, method: "PATCH", body: event,
        });
      },
      invalidatesTags: (result, error) => error ? [] : ["Events"],
    }),
    deleteEvent: builder.mutation({
      queryFn: ({ id }, api, extraOptions, baseQuery) => {
        if (typeof id !== "string" || !id.trim()) {
          return { error: { status: "CUSTOM_ERROR", error: "Identifiant d’événement absent." } };
        }
        return baseQuery({
          url: `events/${encodeURIComponent(id)}.json`, method: "DELETE",
        });
      },
      invalidatesTags: (result, error) => error ? [] : ["Events"],
    }),
  }),
});

export const {
  useGetAllEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation,
} = agendaApi;
