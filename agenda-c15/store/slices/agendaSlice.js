import { createSlice } from "@reduxjs/toolkit";

const initialState = { events: [] };

export const agendaSlice = createSlice({
  name: "agenda",
  initialState,
  reducers: {
    setEvents: (state, action) => { state.events = action.payload; },
    addEvent: (state, action) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.events.findIndex((event) => event.id === action.payload.id);
      if (index >= 0) state.events[index] = action.payload;
    },
    removeEvent: (state, action) => {
      const index = state.events.findIndex((event) => event.id === action.payload.id);
      if (index >= 0) state.events.splice(index, 1);
    },
  },
});

export const { addEvent, updateEvent, removeEvent, setEvents } = agendaSlice.actions;

export default agendaSlice.reducer;
