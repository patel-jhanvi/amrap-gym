import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { membershipService } from "../../services/membershipService";
import { gymService } from "../../services/gymService";
import { getGymImagePath, FALLBACK_IMAGE_PATH } from "../../utils/imageUtils";
import type { Gym } from "../../types/Gym";
import type { User } from "../../types/User";

// Define the expected structure for a member in the list
interface MemberData extends User {
    joinDate: string;
    gymName: string;
}

// Helper component for cleaner stat boxes
const DetailBox = ({ title, value }: { title: string; value: string | number | null | undefined }) => (
    <div className="bg-slate-700 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-xl font-bold text-white mt-1">{value || "N/A"}</p>
    </div>
);


export default function GymDetailsPage() {
    const { id } = useParams();

    // States for Gym Data
    const [gym, setGym] = useState<Gym | null>(null);
    const [currentMembers, setCurrentMembers] = useState(0);

    // States for Member Data
    const [users, setUsers] = useState<MemberData[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState("");


    const load = async () => {
        setLoading(true);
        try {
            // 1. Fetch Gym Details (Fixed function name)
            const gymData = await gymService.getById(id!);
            setGym(gymData);

            // Set initial image source
            setImageSrc(getGymImagePath(gymData.name));

            // 2. Fetch Member Details
            const members: MemberData[] = await membershipService.getUsersInGym(id!);
            setUsers(members);
            setCurrentMembers(members.length);

        } catch (e) {
            console.error("Failed to load gym or members:", e);
        } finally {
            setLoading(false);
        }
    };

    // Handle image load failure by switching to the fallback image
    const handleImageError = () => {
        setImageSrc(FALLBACK_IMAGE_PATH);
    };


    useEffect(() => {
        load();
    }, [id]);

    if (!gym && !loading) {
        return (
            <div className="p-10 min-h-screen bg-slate-900 text-white">
                <h1 className="text-4xl font-bold text-rose-400 mb-4">Gym Not Found</h1>
                <Link
                    to="/gyms"
                    className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                >
                    ← Back to Gyms
                </Link>
            </div>
        )
    }

    const spotsLeft = gym?.maxCapacity !== null && gym?.maxCapacity !== undefined
        ? gym.maxCapacity - currentMembers
        : "Unlimited";

    const capacityStatusColor = spotsLeft === 0
        ? "text-rose-400"
        : (spotsLeft !== "Unlimited" && spotsLeft < 5 ? "text-yellow-400" : "text-green-400");


    return (
        <div className="p-10 min-h-screen bg-slate-900 text-white">
            <Link
                to="/gyms"
                className="inline-block mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
            >
                ← Back to Gyms
            </Link>

            {loading ? (
                <p className="text-gray-300">Loading gym details...</p>
            ) : (
                <>
                    {/* Gym Details and Image Section */}
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl mb-10">
                        <div className="flex flex-col lg:flex-row">

                            {/* Image Section */}
                            <div className="lg:w-1/3 h-64 lg:h-auto overflow-hidden">
                                <img
                                    src={imageSrc}
                                    alt={`${gym?.name} interior`}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                            </div>

                            {/* Info Section */}
                            <div className="lg:w-2/3 p-8">
                                <h1 className="text-4xl font-extrabold mb-4 text-indigo-400">
                                    {gym?.name || "N/A"}
                                </h1>

                                {/* Key Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                    <DetailBox title="Type" value={gym?.type || "N/A"} />
                                    <DetailBox title="Location" value={gym?.location || "N/A"} />
                                    <DetailBox title="Max Capacity" value={gym?.maxCapacity !== null ? gym?.maxCapacity : "Unlimited"} />
                                </div>

                                {/* Capacity/Member Stats */}
                                <div className="border-t border-slate-700 pt-6 mt-4">
                                    <h2 className="text-2xl font-bold mb-2">Membership Status</h2>
                                    <p className="text-gray-300 text-lg">
                                        Current Members: <span className="font-semibold text-white">{currentMembers}</span>
                                    </p>
                                    <p className={`text-xl font-bold mt-1 ${capacityStatusColor}`}>
                                        Spots Left: {spotsLeft}
                                    </p>
                                </div>

                                {/* Actions (Edit Gym) */}
                                <div className="mt-8">
                                    <button
                                        // Placeholder for opening the Edit Gym Modal
                                        onClick={() => console.log("Open Edit Modal for:", gym?.id)}
                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold shadow-md"
                                    >
                                        Edit Gym Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Members List Section */}
                    <h2 className="text-3xl font-bold mb-6 mt-10 border-b border-slate-700 pb-2">
                        Enrolled Members ({currentMembers})
                    </h2>

                    {!users || users.length === 0 ? (
                        <p className="text-gray-400">No members currently enrolled at this gym.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Goal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3"></th> {/* Action column */}
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.fitnessGoal || "N/A"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {new Date(user.joinDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300"
                                                >
                                                    View Profile
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}