import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Agent, VALID_AGENTS } from "@/types/ticket";

interface AgentState {
  selectedAgentId: string;
  agents: Agent[];
}

const STORAGE_KEY = "support_agent_id";

function getInitialAgentId(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_AGENTS.some((a) => a.id === stored)) {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }
  return "agent-1";
}

const initialState: AgentState = {
  selectedAgentId: "agent-1",
  agents: VALID_AGENTS,
};

export const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    initializeAgent: (state) => {
      state.selectedAgentId = getInitialAgentId();
    },
    setSelectedAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgentId = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, action.payload);
        } catch {
          // Ignore storage errors
        }
      }
    },
  },
});

export const { initializeAgent, setSelectedAgent } = agentSlice.actions;
export default agentSlice.reducer;
