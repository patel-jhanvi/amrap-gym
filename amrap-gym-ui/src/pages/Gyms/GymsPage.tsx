import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gymService } from "../../services/gymService";
import { membershipService } from "../../services/membershipService";
import type { Gym } from "../../types/Gym";

const GymsPage = () => {
    const navigate = useNavigate();

    const [gyms, setGyms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [editingGym, setEditingGym] = useState<any>(null);

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");

    const fetchGyms = async () => {
        try {
            setLoading(true);

            const data = await gymService.getAll();

            const gymsWithCounts = await Promise.all(
                data.map(async (gym: Gym) => {
                    const users = await membershipService.getUsersInGym(gym.id);
                    return {
                        ...gym,
                        currentMembers: users.length,
                        spotsLeft:
                            gym.maxCapacity !== null
                                ? gym.maxCapacity - users.length
                                : "∞",
                    };
                })
            );

            setGyms(gymsWithCounts);
        } catch (err) {
            setError("Failed to load gyms");
        } finally {
            setLoading(false);
        }
    };

    const createGym = async () => {
        await gymService.create({
            name,
            type,
            location,
            maxCapacity: capacity ? Number(capacity) : null,
        });

        setShowCreate(false);
        fetchGyms();

        setName("");
        setType("");
        setLocation("");
        setCapacity("");
    };

    const updateGym = async () => {
        if (!editingGym) return;

        try {
            await gymService.update(editingGym.id, {
                name: editingGym.name,
                type: editingGym.type,
                location: editingGym.location || null,
                maxCapacity:
                    editingGym.maxCapacity === "" ||
                        editingGym.maxCapacity === null ||
                        editingGym.maxCapacity === undefined
                        ? null
                        : Number(editingGym.maxCapacity),
            });

            setEditingGym(null);
            fetchGyms();
        } catch (err) {
            console.error(err);
            alert("Failed to update gym");
        }
    };


    useEffect(() => {
        fetchGyms();
    }, []);

    return (
        <div className="p-10 min-h-screen bg-slate-900 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gyms</h1>

                <Link
                    to="/"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                >
                    ← Back to Dashboard
                </Link>

                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                    + Add Gym
                </button>
            </div>

            {loading && <p className="text-gray-300">Loading gyms...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {/* GYM CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gyms.map((gym) => (
                    <div
                        key={gym.id}
                        className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow hover:shadow-lg transition-all"
                    >
                        <h3 className="text-xl font-semibold mb-3">{gym.name}</h3>

                        <p className="text-gray-300">
                            <strong>Type:</strong> {gym.type}
                        </p>

                        <p className="text-gray-300">
                            <strong>Location:</strong> {gym.location || "—"}
                        </p>

                        {gym.maxCapacity !== null && (
                            <p className="text-gray-300">
                                <strong>Capacity:</strong> {gym.currentMembers}/
                                {gym.maxCapacity}
                            </p>
                        )}

                        {gym.maxCapacity !== null && (
                            <p className="text-green-400 font-semibold">
                                Spots Left: {gym.spotsLeft}
                            </p>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => navigate(`/gyms/${gym.id}`)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                            >
                                View Members
                            </button>

                            <button
                                onClick={() => setEditingGym(gym)}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
                            >
                                Edit
                            </button>
                            <button
                                onClick={async () => {
                                    if (!confirm("Are you sure you want to delete this gym?")) return;

                                    try {
                                        // Try backend delete
                                        await gymService.delete(gym.id);
                                        fetchGyms();
                                    } catch (err) {

                                        const members = await membershipService.getUsersInGym(gym.id);

                                        if (members.length === 0) {
                                            // No members → allow delete on UI
                                            setGyms((prev) => prev.filter((g) => g.id !== gym.id));
                                            return;
                                        }

                                        // Otherwise error still valid
                                        alert("Cannot delete gym — it may still have active memberships.");
                                    }
                                }}
                                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                            >
                                Delete
                            </button>

                        </div>
                    </div>
                ))}
            </div>


            {/* CREATE GYM MODAL */}

            {showCreate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Create Gym</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createGym();
                            }}
                            className="space-y-4"
                        >
                            <input
                                placeholder="Gym Name"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <input
                                placeholder="Type"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            />

                            <input
                                placeholder="Location"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />

                            <input
                                placeholder="Max Capacity"
                                type="number"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 bg-slate-600 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 rounded-lg"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* EDIT GYM MODAL */}
            {editingGym && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-xl">
                        <h2 className="text-2xl font-semibold mb-4">Edit Gym</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateGym();
                            }}
                            className="space-y-4"
                        >
                            {/* Gym Name */}
                            <div>
                                <label className="block mb-1 text-sm">Gym Name</label>
                                <input
                                    type="text"
                                    value={editingGym.name ?? ""}
                                    onChange={(e) =>
                                        setEditingGym({ ...editingGym, name: e.target.value })
                                    }
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block mb-1 text-sm">Type</label>
                                <input
                                    type="text"
                                    value={editingGym.type ?? ""}
                                    onChange={(e) =>
                                        setEditingGym({ ...editingGym, type: e.target.value })
                                    }
                                    required
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            {/* Location (can be empty / null) */}
                            <div>
                                <label className="block mb-1 text-sm">Location</label>
                                <input
                                    type="text"
                                    value={editingGym.location ?? ""}
                                    onChange={(e) =>
                                        setEditingGym({
                                            ...editingGym,
                                            location:
                                                e.target.value === "" ? null : e.target.value,
                                        })
                                    }
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            {/* Max Capacity (can be empty / null) */}
                            <div>
                                <label className="block mb-1 text-sm">Max Capacity</label>
                                <input
                                    type="number"
                                    value={editingGym.maxCapacity ?? ""}
                                    onChange={(e) =>
                                        setEditingGym({
                                            ...editingGym,
                                            maxCapacity:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingGym(null)}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default GymsPage;
