import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { migrateLegacyAuthStorage } from "./utils/auth";
import { initTheme } from "./utils/theme";
import "./index.css";

initTheme();
migrateLegacyAuthStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
