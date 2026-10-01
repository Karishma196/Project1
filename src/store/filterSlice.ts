import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TicketFilters } from "@/types/ticket";

interface FilterState extends TicketFilters {}

const initialState: FilterState = {
  status: "all",
  priority: "all",
  category: "all",
  triage_decision: "all",
  search: "",
};

export const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<{ key: keyof TicketFilters; value: string }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    setAllFilters: (state, action: PayloadAction<Partial<TicketFilters>>) => {
      if (action.payload.status !== undefined) state.status = action.payload.status;
      if (action.payload.priority !== undefined) state.priority = action.payload.priority;
      if (action.payload.category !== undefined) state.category = action.payload.category;
      if (action.payload.triage_decision !== undefined)
        state.triage_decision = action.payload.triage_decision;
      if (action.payload.search !== undefined) state.search = action.payload.search;
    },
    resetFilters: () => initialState,
  },
});

export const { setFilter, setAllFilters, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
