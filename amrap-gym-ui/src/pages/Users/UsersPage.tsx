import { useEffect, useState, useMemo } from "react";
import { userService } from "../../services/userService";
import { gymService } from "../../services/gymService";
import api from "../../services/api";

import type { Gym } from "../../types/Gym";
import type { User } from "../../types/User";
import { Link, useNavigate } from "react-router-dom";

// Define the structure for a Gym with the attached Membership data
interface GymWithMembership extends Gym {
    joinDate?: string;
}

// FINAL FIX: We only extend Gym to add the calculated property (availableSpots).
// This resolves the TS conflict with 'maxCapacity'.
interface GymWithAvailability extends Gym {
    availableSpots: number;
}


// --- START: UserCard Component ---

interface UserCardProps {
    user: User;
    userGyms: Record<string, GymWithMembership[]>;
    navigate: ReturnType<typeof useNavigate>;
    handleDelete: (userId: string) => Promise<void>;
}

const UserCard = ({ user, userGyms, navigate, handleDelete }: UserCardProps) => {
    const assigned = userGyms[user.id] || [];
    const gymList = assigned.map((g: Gym) => g.name).join(", ");

    // Determine the user's age for display (assuming dateOfBirth is YYYY-MM-DD)
    const calculateAge = (dob: string | undefined) => {
        if (!dob) return "N/A";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    const userAge = calculateAge(user.dateOfBirth);

    // --- JOIN DATE FIX: Look for the earliest membership date ---
    const earliestMembership = assigned.reduce((earliest, current) => {
        if (!current.joinDate) return earliest;

        const currentDate = new Date(current.joinDate);

        if (!earliest.joinDate) return current;

        const earliestDate = new Date(earliest.joinDate);

        return currentDate < earliestDate ? current : earliest;
    }, assigned[0] || {} as GymWithMembership);

    const memberSinceDate = (earliestMembership?.joinDate)
        ? new Date(earliestMembership.joinDate).toLocaleDateString()
        : (user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A");

    // --- END JOIN DATE FIX ---


    return (
        // Entire card is clickable to navigate to the profile page
        <div
            key={user.id}
            className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-indigo-400 cursor-pointer"
            onClick={() => navigate(`/users/${user.id}`)}
        >
            {/* Top Bar showing "Member Since" */}
            <div className="p-2 bg-indigo-600/50 text-xs font-semibold text-white">
                Member Since: {memberSinceDate}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-1 text-indigo-400">{user.name}</h3>

                <div className="flex justify-between items-center text-sm text-gray-300 mb-3 border-b border-slate-700 pb-2">
                    <p>Age: <span className="font-semibold text-white">{userAge}</span></p>
                    <p>{user.email}</p>
                </div>

                <div className="space-y-2 text-gray-300">
                    <p className="flex justify-between items-start">
                        <span className="font-medium text-gray-100">Goal:</span>
                        <span className="font-semibold text-right max-w-[60%]">{user.fitnessGoal || "Not Set"}</span>
                    </p>

                    <p className="flex justify-between items-start">
                        <span className="font-medium text-gray-100">Gyms:</span>
                        <span className="font-semibold text-right max-w-[60%]">
                            {assigned.length === 0 ? "No assignment" : gymList}
                        </span>
                    </p>
                </div>

                {/* Actions - Prevent click propagation */}
                <div className="flex gap-3 mt-5 pt-3 border-t border-slate-700" onClick={(e) => e.stopPropagation()}>

                    <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
                    >
                        View Profile
                    </button>
                    <button
                        // Edit button color: Emerald
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-semibold"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(user.id)}
                        // Delete button color: Rose
                        className="px-3 py-2 bg-rose-800 hover:bg-rose-700 rounded-lg text-white text-sm font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END: UserCard Component ---


const UsersPage = () => {
    const navigate = useNavigate();

    // Use GymWithMembership type
    const [users, setUsers] = useState<User[]>([]);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [userGyms, setUserGyms] = useState<Record<string, GymWithMembership[]>>({});

    // STATE FOR SEARCH
    const [searchTerm, setSearchTerm] = useState("");

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

    // Fetch all users with optional search term (TS FIX APPLIED HERE)
    const loadUsers = async (search: string = "") => {
        try {
            setLoading(true);

            // NOTE: Assuming your userService.getAll is updated to pass the search query
            const data = await userService.getAll(search);

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

    // Fetch gym assignments per user (using the new GymWithMembership type)
    const loadUserGyms = async (list: User[]) => {
        const map: Record<string, GymWithMembership[]> = {};

        for (const user of list) {
            try {
                // NOTE: We rely on this API call returning the membership date on the Gym objects
                const res = await api.get(`/users/${user.id}/gyms`);
                map[user.id] = res.data;
            } catch {
                map[user.id] = [];
            }
        }

        setUserGyms(map);
    };

    // Initial fetch and refetch when searchTerm changes (Backend Filtering)
    useEffect(() => {
        const fetchAll = async () => {
            await loadUsers(searchTerm); // Pass the current search term
        };
        fetchAll();
        loadGyms();

        // Dependency array ensures loadUsers runs every time searchTerm changes
    }, [searchTerm]);

    // Runs whenever users list changes (needed for UserCard to display gym info)
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
            loadUsers(); // Reloads data after creation

            setName("");
            setEmail("");
            setDob("");
            setGoal("");
            setSelectedGym("");
        } catch {
            alert("Failed to create user");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await userService.delete(userId);
            loadUsers(); // Reloads data after deletion
        } catch {
            alert("Failed to delete user.");
        }
    };

    // --- GYM SORTING LOGIC ---
    const sortedGyms = useMemo(() => {
        // NOTE: This logic relies on the Gym state having maxCapacity and currentMembers
        // properties attached, which is often done in GymsPage but might be missing here.
        // We use safe typing to avoid errors, assuming capacity/member data is available.

        const gymsWithAvailability: GymWithAvailability[] = gyms.map(gym => {
            // Get capacity directly from the Gym type, handling null capacity
            const capacity = gym.maxCapacity ?? 0;

            // NOTE: We rely on 'currentMembers' being available, or we default it to 0.
            const members = (gym as any).currentMembers || 0;

            const availableSpots = capacity - members;

            return {
                ...gym,
                availableSpots: availableSpots,
            } as GymWithAvailability;
        });

        // Sort by availableSpots in descending order (most spots first)
        return gymsWithAvailability.sort((a, b) => {
            // Handle null/undefined capacity safely for sorting, prioritizing defined spots
            const aSpots = a.availableSpots;
            const bSpots = b.availableSpots;

            if (aSpots === undefined || aSpots === null) return 1; // Put undefined spots last
            if (bSpots === undefined || bSpots === null) return -1; // Put undefined spots last

            return bSpots - aSpots;
        });

    }, [gyms]);
    // --- END GYM SORTING LOGIC ---


    return (
        <div className="p-10 min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Users</h1>

                <div className="flex gap-4 items-center">
                    <Link
                        to="/"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                        ← Back to Dashboard
                    </Link>
                    <button
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg shadow font-semibold"
                        onClick={() => setShowCreate(true)}
                    >
                        + Add User
                    </button>
                </div>
            </div>

            {/* Search Bar Implementation */}
            <div className="mb-8 max-w-lg">
                <input
                    type="text"
                    placeholder="Search by name, email, or fitness goal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {/* Users list - Now using users (filtered by server) and UserCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {users.map((user: User) => (
                    <UserCard
                        key={user.id}
                        user={user}
                        userGyms={userGyms}
                        navigate={navigate}
                        handleDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Message when no results found */}
            {!loading && users.length === 0 && searchTerm && (
                <p className="text-gray-400 mt-6">
                    No users found matching "{searchTerm}".
                </p>
            )}


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

                                    {/* UPDATED: Use sortedGyms and show availability */}
                                    {sortedGyms.map((gym) => (
                                        <option
                                            key={gym.id}
                                            value={gym.id}
                                            // Disable if no spots are available
                                            disabled={gym.availableSpots <= 0}
                                        >
                                            {gym.name}
                                            {gym.availableSpots > 0
                                                ? ` (${gym.availableSpots} spots available)`
                                                : ` (FULL)`
                                            }
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
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold"
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