import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="p-10 min-h-screen text-white">

            <h1 className="text-4xl font-extrabold mb-2 text-indigo-400">AMRAP Gym Dashboard</h1>

            <blockquote className="text-xl italic mb-10 text-gray-300 border-l-4 border-indigo-400 pl-4">
                "Capacity is the ultimate measure of performance."
            </blockquote>

            {/* Image Display (Focused and Framed) */}
            <div className="mb-10 w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-slate-700">
                <img
                    src="/images/dashboard-hero.jpg"
                    alt="Gym interior and equipment"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Navigation Cards - Two columns for Gyms and Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto">

                <Link
                    to="/gyms"
                    className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 shadow-xl hover:shadow-2xl hover:border-indigo-400 transition-all text-center backdrop-blur-sm"
                >
                    <h2 className="text-3xl font-bold mb-2">Manage Gyms</h2>
                    <p className="text-gray-400 text-lg">Manage gym locations, capacity, and availability.</p>
                </Link>

                <Link
                    to="/users"
                    className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 shadow-xl hover:shadow-2xl hover:border-indigo-400 transition-all text-center backdrop-blur-sm"
                >
                    <h2 className="text-3xl font-bold mb-2">Manage Users</h2>
                    <p className="text-gray-400 text-lg">View, register, and manage member profiles.</p>
                </Link>

            </div>

        </div>
    );
};

export default Home;