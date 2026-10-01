import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import agentReducer from "./agentSlice";
import metricsReducer from "./metricsSlice";
import filterReducer from "./filterSlice";
import liveUpdatesReducer from "./liveUpdatesSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      agent: agentReducer,
      metrics: metricsReducer,
      filters: filterReducer,
      liveUpdates: liveUpdatesReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
