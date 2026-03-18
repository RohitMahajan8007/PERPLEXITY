import { createRoot } from "react-dom/client";
import "./App/index.css";
import App from "./App/App.jsx";
import { store } from "./App/app.store.js";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
