import { useState } from "react";
import type { Gym } from "../../types/Gym";
import { gymService } from "../../services/gymService";

interface Props {
    gym: Gym;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditGymModal({ gym, onClose, onUpdated }: Props) {
    const [name, setName] = useState(gym.name);
    const [type, setType] = useState(gym.type);
    const [location, setLocation] = useState(gym.location || "");
    const [capacity, setCapacity] = useState(
        gym.maxCapacity ? String(gym.maxCapacity) : ""
    );

    const handleUpdate = async () => {
        await gymService.update(gym.id, {
            name,
            type,
            location,
            maxCapacity: capacity ? parseInt(capacity) : null,
        });

        onUpdated();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl w-96 border border-slate-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Gym</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm mb-1">Name</label>
                        <input
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Type</label>
                        <input
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Location</label>
                        <input
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Max Capacity</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        onClick={handleUpdate}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
