import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-slate-900 text-slate-100">
                <AppRoutes />
            </div>
        </BrowserRouter>
    );
}

export default App;
