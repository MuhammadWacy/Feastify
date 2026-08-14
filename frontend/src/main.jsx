import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";
import "./styles/checkout.css";
import App from "./App.jsx";
import { initializeOneSignal } from "./services/oneSignalService";

function Root() {
    useEffect(() => {
        initializeOneSignal().catch((error) => {
            console.error("OneSignal startup failed:", error);
        });
    }, []);

    return <App />;
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Root />
    </StrictMode>
);
