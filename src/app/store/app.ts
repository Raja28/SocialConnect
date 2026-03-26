// // import { configureStore } from "@reduxjs/toolkit";
// // import userSlice from "./userSlice";
// // import profileSlice from "./profileSlice";

// // export const store = configureStore({
// //     reducer: {
// //         user: userSlice,
// //         profile: profileSlice
// //     }
// // })

// // export type RootState = ReturnType<typeof store.getState>
// // export type AppDispatch = typeof store.dispatch

// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import userSlice from "./userSlice";
// import profileSlice from "./profileSlice";

// import storage from "redux-persist/lib/storage"; // uses localStorage internally
// import { persistReducer, persistStore } from "redux-persist";

// const rootReducer = combineReducers({
//   user: userSlice,
//   profile: profileSlice,
// });

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["user", "profile"], // what to persist
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import profileSlice from "./profileSlice";

import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem() {
      return Promise.resolve();
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const rootReducer = combineReducers({
  user: userSlice,
  profile: profileSlice,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "profile"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
