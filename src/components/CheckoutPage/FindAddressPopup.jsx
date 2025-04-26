import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPafData } from "../../api/paf";

export const FindAddressPopup = ({ show, onClose, postcode, setDonation, donation }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ Ensure `useQuery` always runs and handles undefined data
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["address_data", postcode],
        queryFn: () => getPafData(postcode),
        enabled: !!postcode, // Fetch only if postcode exists
        refetchInterval: 300000,
    });


    // Handle case where data is not an array or is undefined
    const filteredAddresses = Array.isArray(data)
        ? data.filter((address) => {
            const fullAddress = `${address.address1 || ""} ${address.address2 || ""} ${address.post_town || ""} ${address.postcode || ""}`.toLowerCase();
            return fullAddress.includes(searchTerm.toLowerCase());
        })
        : [];

    const handleSelectAddress = (address) => {

        setDonation((prev) => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                address1: address.address1 || "",
                address2: address.address2 || "",
                city: address.post_town || "",
                postcode: address.postcode || "",
            },
        }));
        onClose();
    };

    if (!show) return null; // ✅ Only return null for the component, but keep hooks outside

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                <h3 className="text-lg font-semibold mb-4">Select an Address</h3>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search address..."
                    className="w-full p-2 border rounded mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* API States */}
                {isLoading && <p className="text-gray-600">Loading addresses...</p>}
                {isError && <p className="text-red-600">Error: {error?.message || "Failed to load data"}</p>}
                {!isLoading && !isError && !Array.isArray(data) && (
                    <p className="text-red-600">Invalid data format received.</p>
                )}

                {/* Address Table */}
                {filteredAddresses.length > 0 ? (
                    <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-gray-200 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">Address</th>
                                    <th className="p-2">Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAddresses.map((address, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-100">
                                        <td className="p-2">
                                            {address.address1 || "N/A"}, {address.address2 || "N/A"}, {address.post_town || "N/A"}, {address.postcode || "N/A"}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                className="bg-black text-white px-3 py-1 rounded text-xs"
                                                onClick={() => handleSelectAddress(address)}
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    !isLoading && <p className="text-sm text-gray-500">No matching addresses found.</p>
                )}

                {/* Close Button */}
                <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};
