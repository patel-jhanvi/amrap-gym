import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="p-10 min-h-screen text-white">
            <h1 className="text-4xl font-bold mb-10">AMRAP Gym Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                <Link
                    to="/gyms"
                    className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-md hover:shadow-lg hover:border-slate-500 transition-all text-center"
                >
                    <h2 className="text-2xl font-semibold mb-2">Gyms</h2>
                    <p className="text-gray-400">Manage gym locations, capacity, and availability.</p>
                </Link>

                <Link
                    to="/users"
                    className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-md hover:shadow-lg hover:border-slate-500 transition-all text-center"
                >
                    <h2 className="text-2xl font-semibold mb-2">Users</h2>
                    <p className="text-gray-400">View and register members in the system.</p>
                </Link>

                <Link
                    to="/memberships"
                    className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-md hover:shadow-lg hover:border-slate-500 transition-all text-center"
                >
                    <h2 className="text-2xl font-semibold mb-2">Memberships</h2>
                    <p className="text-gray-400">Assign users to gyms and view active memberships.</p>
                </Link>

            </div>

        </div>
    );
};

export default Home;
