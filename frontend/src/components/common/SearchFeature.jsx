import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../config/api";

const SearchFeature = () => {
    const [query, setQuery] = useState("");

    // Query to fetch users based on search input
    const { data: users, isLoading, isError } = useQuery(
        ["searchUsers", query],
        async () => {
            const res = await fetch(`${API_BASE_URL}/api/users/search?query=${query}`, { credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to search users.");
            return data;
        },
        {
            enabled: query.length > 0, // Only fetch if the query is not empty
        }
    );

    // Handle input changes
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    return (
        <div>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Type username or full name..."
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                value={query}
                onChange={handleInputChange}
            />

            {/* Search Results */}
            <div>
                {isLoading && <p>Loading users...</p>}
                {isError && <p>Error fetching users. Please try again.</p>}
                {users?.length === 0 && query && <p>No users found.</p>}
                <ul className="space-y-4">
                    {users?.map((user) => (
                        <li key={user._id} className="p-4 border rounded-lg flex items-center gap-4 hover:bg-gray-100">
                            <img
                                src={user.profileImg || "/avatar-placeholder.png"}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-medium">{user.fullName || "N/A"}</p>
                                <p className="text-gray-600 text-sm">@{user.username}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SearchFeature;
