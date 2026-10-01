import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface MetricsState {
  myTicketsCount: number;
  toReviewCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: MetricsState = {
  myTicketsCount: 0,
  toReviewCount: 0,
  loading: false,
  error: null,
};

export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tickets/metrics?agent_id=${encodeURIComponent(agentId)}`);
      if (!res.ok) {
        return rejectWithValue("Failed to fetch metrics");
      }
      const data = await res.json();
      return data as { myTicketsCount: number; toReviewCount: number };
    } catch {
      return rejectWithValue("Network error fetching metrics");
    }
  }
);

export const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    setMetrics: (
      state,
      action: PayloadAction<{ myTicketsCount: number; toReviewCount: number }>
    ) => {
      state.myTicketsCount = action.payload.myTicketsCount;
      state.toReviewCount = action.payload.toReviewCount;
    },
    incrementMyTickets: (state) => {
      state.myTicketsCount += 1;
    },
    decrementMyTickets: (state) => {
      state.myTicketsCount = Math.max(0, state.myTicketsCount - 1);
    },
    decrementToReview: (state) => {
      state.toReviewCount = Math.max(0, state.toReviewCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.myTicketsCount = action.payload.myTicketsCount;
        state.toReviewCount = action.payload.toReviewCount;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setMetrics,
  incrementMyTickets,
  decrementMyTickets,
  decrementToReview,
} = metricsSlice.actions;

export default metricsSlice.reducer;
