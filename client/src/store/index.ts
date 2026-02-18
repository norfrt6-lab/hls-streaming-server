import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { baseApi } from "./api/base-api";
import authReducer from "./slices/auth-slice";
import uiReducer from "./slices/ui-slice";
import socketReducer from "./slices/socket-slice";
import chatReducer from "./slices/chat-slice";
import playerReducer from "./slices/player-slice";
import rootSaga from "./root-saga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    socket: socketReducer,
    chat: chatReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    })
      .concat(baseApi.middleware)
      .concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
