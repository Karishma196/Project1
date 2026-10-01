import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Ticket } from "@/types/ticket";

interface LiveUpdatesState {
  pendingNewTickets: Ticket[];
  lastPollTimestamp: string;
}

const initialState: LiveUpdatesState = {
  pendingNewTickets: [],
  lastPollTimestamp: new Date().toISOString(),
};

export const liveUpdatesSlice = createSlice({
  name: "liveUpdates",
  initialState,
  reducers: {
    addPendingNewTickets: (state, action: PayloadAction<Ticket[]>) => {
      // Append only tickets not already pending
      const existingIds = new Set(state.pendingNewTickets.map((t) => t.external_id));
      for (const t of action.payload) {
        if (!existingIds.has(t.external_id)) {
          state.pendingNewTickets.push(t);
          existingIds.add(t.external_id);
        }
      }
    },
    clearPendingNewTickets: (state) => {
      state.pendingNewTickets = [];
    },
    setLastPollTimestamp: (state, action: PayloadAction<string>) => {
      state.lastPollTimestamp = action.payload;
    },
  },
});

export const {
  addPendingNewTickets,
  clearPendingNewTickets,
  setLastPollTimestamp,
} = liveUpdatesSlice.actions;

export default liveUpdatesSlice.reducer;
