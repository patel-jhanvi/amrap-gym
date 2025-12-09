import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gymService } from "../../services/gymService";
import { membershipService } from "../../services/membershipService";
import type { Gym } from "../../types/Gym";
import { getGymImagePath, FALLBACK_IMAGE_PATH } from "../../utils/imageUtils";


interface GymWithCounts extends Gym {
    currentMembers: number;
    spotsLeft: number | string;
}

interface GymCardProps {
    gym: GymWithCounts;
    navigate: ReturnType<typeof useNavigate>;
    setEditingGym: (gym: GymWithCounts) => void;
    handleDelete: (gym: GymWithCounts) => Promise<void>;
}

const GymCard = ({ gym, navigate, setEditingGym, handleDelete }: GymCardProps) => {

    const [imageSrc, setImageSrc] = useState(getGymImagePath(gym.name));


    const handleImageError = () => {
        setImageSrc(FALLBACK_IMAGE_PATH);
    };

    return (

        <div
            key={gym.id}
            className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-indigo-400 cursor-pointer"
            onClick={() => navigate(`/gyms/${gym.id}`)}
        >
            {/* Image Section */}
            <div className="h-40 w-full overflow-hidden">
                <img
                    src={imageSrc}
                    alt={`${gym.name} interior`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={handleImageError}
                    loading="lazy"
                />
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2 text-indigo-400">{gym.name}</h3>

                <div className="space-y-1 mb-4 text-gray-300">
                    <p>
                        <strong>Type:</strong> {gym.type}
                    </p>
                    <p>
                        <strong>Location:</strong> {gym.location || "N/A"}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700">
                    <p className="text-sm">
                        Capacity:{" "}
                        <span className="font-semibold text-white">
                            {gym.maxCapacity !== null
                                ? `${gym.currentMembers} / ${gym.maxCapacity}`
                                : "Unlimited"}
                        </span>
                    </p>

                    {/* Check if maxCapacity is NOT null before applying specific color logic */}
                    {gym.maxCapacity !== null && (
                        <p
                            className={`font-bold text-lg mt-1 ${(gym.spotsLeft as number) === 0
                                ? "text-rose-400"
                                : (gym.spotsLeft as number) < 5
                                    ? "text-yellow-400"
                                    : "text-green-400"
                                }`}
                        >
                            Spots Left: {gym.spotsLeft}
                        </p>
                    )}
                </div>


                <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>

                    <button
                        onClick={() => navigate(`/gyms/${gym.id}`)}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
                    >
                        View Details
                    </button>

                    <button
                        onClick={() => setEditingGym(gym)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-semibold"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(gym)}
                        className="px-4 py-2 bg-rose-800 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END: GymCard Component ---


const GymsPage = () => {
    const navigate = useNavigate();

    const [gyms, setGyms] = useState<GymWithCounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // STATE FOR SEARCH
    const [searchTerm, setSearchTerm] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [editingGym, setEditingGym] = useState<any>(null);

    // STATE FOR NEW GYM FORM
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
                    } as GymWithCounts;
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

    const handleDelete = async (gym: GymWithCounts) => {
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
    }


    useEffect(() => {
        fetchGyms();
    }, []);


    // --- SEARCH FILTERING LOGIC ---
    const filteredGyms = useMemo(() => {
        if (!searchTerm) {
            return gyms;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();

        return gyms.filter(gym =>
            // Search by Name, Type, or Location
            gym.name.toLowerCase().includes(lowerCaseSearch) ||
            gym.type.toLowerCase().includes(lowerCaseSearch) ||
            (gym.location && gym.location.toLowerCase().includes(lowerCaseSearch))
        );
    }, [gyms, searchTerm]);
    // --- END SEARCH FILTERING LOGIC ---


    return (
        <div className="p-10 min-h-screen bg-slate-900 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Gyms</h1>

                {/* Header Actions */}
                <div className="flex gap-4 items-center">
                    <Link
                        to="/"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                        ← Back to Dashboard
                    </Link>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold"
                    >
                        + Add Gym
                    </button>
                </div>
            </div>

            {/* Search Bar Implementation */}
            <div className="mb-8 max-w-lg">
                <input
                    type="text"
                    placeholder="Search by gym name, type, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {loading && <p className="text-gray-300">Loading gyms...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {/* GYM CARDS - Now using filteredGyms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGyms.map((gym) => (
                    <GymCard
                        key={gym.id}
                        gym={gym}
                        navigate={navigate}
                        setEditingGym={setEditingGym}
                        handleDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Message when no results found */}
            {!loading && filteredGyms.length === 0 && searchTerm && (
                <p className="text-gray-400 mt-6">
                    No gyms found matching "{searchTerm}".
                </p>
            )}


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
                                    className="px-4 py-2 bg-indigo-600 rounded-lg"
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