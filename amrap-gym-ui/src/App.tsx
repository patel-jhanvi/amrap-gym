import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">

                {/* MAIN CONTENT */}
                <div className="flex-grow">
                    <AppRoutes />
                </div>

                {/* GLOBAL FOOTER */}
                <footer className="mt-auto py-6 text-center text-gray-400 border-t border-slate-700">
                    Developed by <span className="font-semibold">Jhanvi Patel</span> © 2025 —
                    <a
                        href="https://github.com/patel-jhanvi/amrap-gym"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline ml-1"
                    >
                        GitHub
                    </a>
                </footer>

            </div>
        </BrowserRouter>
    );
}

export default App;
