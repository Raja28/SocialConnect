
"use client";

import { Provider } from "react-redux";
import { store, persistor } from "./app";
import { PersistGate } from "redux-persist/integration/react";
import Loading from "../components/Loader";

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading msg="Loading..." />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}