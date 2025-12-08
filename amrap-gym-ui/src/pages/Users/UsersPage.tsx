import { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import { gymService } from "../../services/gymService";
import api from "../../services/api";

import type { Gym } from "../../types/Gym";
import type { User } from "../../types/User";
import { Link } from "react-router-dom";

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [userGyms, setUserGyms] = useState<Record<string, Gym[]>>({});

    // Loading states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create User Modal
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");
    const [goal, setGoal] = useState("");
    const [selectedGym, setSelectedGym] = useState("");

    // Fetch all users
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // Fetch gyms
    const loadGyms = async () => {
        try {
            const data = await gymService.getAll();
            setGyms(data);
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch gym assignments per user
    const loadUserGyms = async (list: User[]) => {
        const map: Record<string, Gym[]> = {};

        for (const user of list) {
            try {
                const res = await api.get(`/users/${user.id}/gyms`);
                map[user.id] = res.data;
            } catch {
                map[user.id] = [];
            }
        }

        setUserGyms(map);
    };

    useEffect(() => {
        const fetchAll = async () => {
            await loadUsers();
        };
        fetchAll();
        loadGyms();
    }, []);

    useEffect(() => {
        if (users.length > 0) loadUserGyms(users);
    }, [users]);

    // Create new user
    const createUser = async () => {
        try {
            const newUser = await userService.create({
                name,
                email,
                dateOfBirth: dob,
                fitnessGoal: goal,
            });

            if (selectedGym) {
                await api.post(`/memberships`, {
                    userId: newUser.id,
                    gymId: selectedGym,
                });
            }

            setShowCreate(false);
            loadUsers();

            setName("");
            setEmail("");
            setDob("");
            setGoal("");
            setSelectedGym("");
        } catch {
            alert("Failed to create user");
        }
    };

    return (
        <div className="p-6 min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <Link
                    to="/"
                    className="inline-block mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                >
                    ← Back to Dashboard
                </Link>
                <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg shadow"
                    onClick={() => setShowCreate(true)}
                >
                    + Add User
                </button>
            </div>

            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {/* Users list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {users.map((user: User) => {
                    const assigned = userGyms[user.id] || [];

                    return (
                        <div
                            key={user.id}
                            className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow hover:shadow-lg transition-all"
                        >
                            <h3 className="text-xl font-semibold">{user.name}</h3>

                            <p className="text-gray-300 mt-1">
                                <span className="font-medium text-gray-100">Email:</span> {user.email}
                            </p>

                            <p className="text-gray-300">
                                <span className="font-medium text-gray-100">Goal:</span>{" "}
                                {user.fitnessGoal}
                            </p>

                            <p className="text-gray-300 mt-2">
                                <span className="font-medium text-gray-100">Gym:</span>{" "}
                                {assigned.length === 0
                                    ? "No gym assigned"
                                    : assigned.map((g: Gym) => g.name).join(", ")}
                            </p>

                            <Link
                                to={`/users/${user.id}`}
                                className="mt-4 inline-block px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                            >
                                View Profile
                            </Link>
                            <button
                                className="mt-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                                onClick={async () => {
                                    if (!confirm("Are you sure you want to delete this user?")) return;

                                    await userService.delete(user.id);
                                    loadUsers();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-xl">
                        <h2 className="text-2xl font-semibold mb-4">Create User</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createUser();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block mb-1 text-sm">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Date of Birth</label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Fitness Goal</label>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Assign Gym</label>
                                <select
                                    value={selectedGym}
                                    onChange={(e) => setSelectedGym(e.target.value)}
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                >
                                    <option value="">None</option>

                                    {gyms.map((gym: Gym) => (
                                        <option key={gym.id} value={gym.id}>
                                            {gym.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
