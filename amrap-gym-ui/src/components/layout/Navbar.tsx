import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="w-full bg-slate-800 border-b border-slate-700 p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <h1 className="text-xl font-bold text-white tracking-wide">
                    AMRAP Gym Dashboard
                </h1>

                <div className="flex gap-6 text-gray-300">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `hover:text-white transition ${isActive ? "text-blue-400 font-semibold" : ""
                            }`
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/gyms"
                        className={({ isActive }) =>
                            `hover:text-white transition ${isActive ? "text-blue-400 font-semibold" : ""
                            }`
                        }
                    >
                        Gyms
                    </NavLink>

                    <NavLink
                        to="/users"
                        className={({ isActive }) =>
                            `hover:text-white transition ${isActive ? "text-blue-400 font-semibold" : ""
                            }`
                        }
                    >
                        Users
                    </NavLink>

                    <NavLink
                        to="/memberships"
                        className={({ isActive }) =>
                            `hover:text-white transition ${isActive ? "text-blue-400 font-semibold" : ""
                            }`
                        }
                    >
                        Memberships
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}
