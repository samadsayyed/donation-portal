import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Lock, MapPin, Heart, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getDonorInfo, updateDonor, updateDonorPassword, addNewAddress, getDonorAddress, getOneOffTransactions } from '../api/donationApi';
import { useQuery, useMutation } from '@tanstack/react-query';

const Profile = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        address1: '',
        address2: '',
        city_id: '',
        post_code: '',
        donor_id: ''
    });

    // Get user email and donor ID from localStorage if not available in auth context
    const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;
    const donorId = user?.user_id || JSON.parse(localStorage.getItem('user'))?.user_id;

    // Fetch donor info using React Query
    const { data: donorInfo, isLoading: isDonorInfoLoading, refetch: refetchDonorInfo } = useQuery({
        queryKey: ['donorInfo', userEmail],
        queryFn: () => getDonorInfo(userEmail),
        enabled: !!userEmail,
        onError: (error) => {
            toast.error(error.message || 'Failed to fetch donor information');
        }
    });

    // Fetch donor address using React Query
    const { data: addressData, isLoading: isAddressLoading, refetch: refetchAddress } = useQuery({
        queryKey: ['donorAddress', donorId],
        queryFn: () => getDonorAddress(donorId),
        enabled: !!donorId
    });

    // Fetch one-off transactions using React Query
    const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['oneOffTransactions', donorId],
        queryFn: () => getOneOffTransactions({
            donor_id: donorId
        }),
        enabled: !!donorId && activeSection === 'donations',
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });


    // Update donor mutation
    const updateDonorMutation = useMutation({
        mutationFn: updateDonor,
        onSuccess: (data) => {
            toast.success(data.message || 'Profile updated successfully');
            refetchDonorInfo(); // Refresh donor info after successful update
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update profile');
        }
    });

    // Add password state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Add password update mutation
    const updatePasswordMutation = useMutation({
        mutationFn: (data) => updateDonorPassword(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Password updated successfully');
            // Reset password fields
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update password');
        }
    });

    const [profileData, setProfileData] = useState({
        title: donorInfo?.data?.title || 'Mr',
        firstName: donorInfo?.data?.first_name || user?.first_name || '',
        lastName: donorInfo?.data?.last_name || user?.last_name || '',
        email: donorInfo?.data?.email || userEmail || '',
        phone: donorInfo?.data?.mobile || user?.phone || '',
    });

    // Update profile data when donor info is loaded
    useEffect(() => {
        if (donorInfo?.data) {
            setProfileData({
                title: donorInfo.data.title || 'Mr',
                firstName: donorInfo.data.first_name || user?.first_name || '',
                lastName: donorInfo.data.last_name || user?.last_name || '',
                email: donorInfo.data.email || userEmail || '',
                phone: donorInfo.data.mobile || user?.phone || '',
            });
        }
    }, [donorInfo, user, userEmail]);

    // Add new address mutation
    const addAddressMutation = useMutation({
        mutationFn: addNewAddress,
        onSuccess: (data) => {
            toast.success(data.message || 'Address added successfully');
            setShowAddressForm(false);
            refetchAddress(); // Refresh address data
            // Reset form
            setAddressFormData({
                address1: '',
                address2: '',
                city_id: '',
                post_code: '',
                donor_id: donorId
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add address');
        }
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        const updateData = {
            donor_id: donorId,
            title: profileData.title,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: profileData.phone
        };

        updateDonorMutation.mutate(updateData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password length
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        const updateData = {
            donor_id: donorId,
            password: passwordData.newPassword
        };

        updatePasswordMutation.mutate(updateData);
    };

    // Handle address form input changes
    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value,
            donor_id: donorId // Always ensure donor_id is set
        }));
    };

    // Handle address form submission
    const handleAddressSubmit = (e) => {
        e.preventDefault();
        addAddressMutation.mutate(addressFormData);
    };

    const menuItems = [
        { id: 'profile', label: 'Profile details', icon: User },
        { id: 'password', label: 'Change Password', icon: Lock },
        { id: 'address', label: 'Your Address', icon: MapPin },
        { id: 'donations', label: 'My Donations', icon: Heart },
        { id: 'debits', label: 'My Direct Debits', icon: CreditCard },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-[#333132]">Profile Details</h2>
                            <Link
                                to="/"
                                className="text-maroon hover:text-opacity-80 transition-colors text-sm font-medium"
                            >
                                Go to Donation Page
                            </Link>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="max-w-3xl">
                            <div className="bg-white rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Title <span className="text-maroon">*</span>
                                        </label>
                                        <select
                                            name="title"
                                            value={profileData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20 bg-white transition-all duration-200"
                                            required
                                        >
                                            <option value="Mr">Mr</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Miss">Miss</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Dr">Dr</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            First Name <span className="text-maroon">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20 transition-all duration-200"
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Last Name <span className="text-maroon">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20 transition-all duration-200"
                                            placeholder="Enter your last name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Phone Number <span className="text-maroon">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20 transition-all duration-200"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[#333132] font-medium mb-2">
                                            Email Address <span className="text-maroon">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                            disabled
                                        />
                                        <p className="text-sm text-gray-500 mt-2">Email cannot be changed</p>
                                    </div>
                                </div>
                                <div className="flex justify-end border-t border-gray-100 pt-6 px-6 pb-6">
                                    <button
                                        type="submit"
                                        disabled={loading || isDonorInfoLoading || updateDonorMutation.isLoading}
                                        className={`bg-maroon text-white px-8 py-3.5 rounded-xl hover:bg-opacity-90 transition-all duration-200 flex items-center font-medium shadow-lg shadow-maroon/20 hover:shadow-xl hover:shadow-maroon/30 hover:translate-y-[-1px] active:translate-y-0 ${(loading || isDonorInfoLoading || updateDonorMutation.isLoading) ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {updateDonorMutation.isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : isDonorInfoLoading ? (
                                            'Loading...'
                                        ) : (
                                            'UPDATE YOUR INFORMATION'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                );
            case 'password':
                return (
                    <div className="p-6">
                        <h2 className="text-3xl font-montserrat text-[#333132] mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordUpdate} className="max-w-md">
                            <div className="mb-4">
                                <label className="block text-[#333132] mb-2">New Password <span className="text-maroon">*</span></label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-maroon"
                                    placeholder="New Password"
                                    required
                                    minLength={8}
                                />
                                <p className="text-sm text-[#333132] mt-2">Use at least 8 characters. Don't use a password from another site, or something too obvious like your pet's name.</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-[#333132] mb-2">Confirm Password <span className="text-maroon">*</span></label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-maroon"
                                    placeholder="Confirm Password"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updatePasswordMutation.isLoading}
                                className={`bg-maroon text-white px-8 py-3 rounded hover:bg-opacity-90 transition-colors flex items-center ${updatePasswordMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {updatePasswordMutation.isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating Password...
                                    </>
                                ) : (
                                    'CHANGE PASSWORD'
                                )}
                            </button>
                        </form>
                    </div>
                );
            case 'address':
                return (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-montserrat text-[#333132] mb-2">Address</h2>
                                <p className="text-gray-500">Manage your addresses for donations</p>
                            </div>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="bg-maroon text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-maroon/20 hover:translate-y-[-1px] active:translate-y-0 flex items-center"
                            >
                                <span className="mr-2">+</span> Add New Address
                            </button>
                        </div>

                        {isAddressLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                            </div>
                        ) : addressData?.data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group bg-white border-2 border-maroon rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-maroon/10">
                                    <div className="bg-maroon text-white px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-white animate-pulse rounded-full mr-2"></span>
                                            <span className="text-sm font-medium">Active Address</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-1.5 text-[#333132]">
                                            <p className="font-medium">{addressData.data.address1}</p>
                                            {addressData.data.address2 && (
                                                <p className="text-gray-600">{addressData.data.address2}</p>
                                            )}
                                            <p className="text-gray-600">{addressData.data.city_name}</p>
                                            <p className="text-gray-600">{addressData.data.post_code}</p>
                                            <p className="text-gray-600">{addressData.data.country_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No address found. Add a new address to get started.</p>
                            </div>
                        )}

                        {/* Add New Address Form Modal */}
                        {showAddressForm && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl transform transition-all duration-300">
                                    <div className="bg-gradient-to-r from-maroon to-maroon/90 text-white px-6 py-4 flex items-center justify-between">
                                        <h3 className="text-lg font-medium">Add New Address</h3>
                                        <button
                                            onClick={() => setShowAddressForm(false)}
                                            className="text-white/80 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <form onSubmit={handleAddressSubmit} className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[#333132] text-sm mb-2">
                                                    Address Line 1 <span className="text-maroon">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address1"
                                                    value={addressFormData.address1}
                                                    onChange={handleAddressInputChange}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                                                    placeholder="Street address or P.O. box"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[#333132] text-sm mb-2">
                                                    Address Line 2
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address2"
                                                    value={addressFormData.address2}
                                                    onChange={handleAddressInputChange}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#333132] text-sm mb-2">
                                                    City ID <span className="text-maroon">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city_id"
                                                    value={addressFormData.city_id}
                                                    onChange={handleAddressInputChange}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[#333132] text-sm mb-2">
                                                    Postal Code <span className="text-maroon">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="post_code"
                                                    value={addressFormData.post_code}
                                                    onChange={handleAddressInputChange}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressForm(false)}
                                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-[#333132] hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={addAddressMutation.isLoading}
                                                className="px-6 py-2.5 bg-maroon text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-maroon/20 hover:translate-y-[-1px] active:translate-y-0 flex items-center"
                                            >
                                                {addAddressMutation.isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Address'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'donations':
                return (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-montserrat text-[#333132]">My Donations</h2>
                        </div>

                        {isTransactionsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                            </div>
                        ) : transactionsData?.data?.length > 0 ? (
                            <div className="space-y-4">
                                {transactionsData?.data?.map((transaction) => (
                                    <div key={transaction.donation_detail_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-[#333132]">{transaction.program_name}</h3>
                                                <p className="text-gray-600">{transaction.country_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-maroon">£{transaction.donation_amount}</p>
                                                <p className="text-sm text-gray-500">{new Date(transaction.donation_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                {/* <img src="/donation-empty.png" alt="No donations" className="mb-4 w-24" /> */}
                                <p className="text-center text-[#333132] uppercase mb-4">YOU DON'T HAVE ANY DONATIONS.</p>
                                <h3 className="text-2xl text-[#333132] mb-4">Become a sponsor</h3>
                                <Link to="/" className="bg-white text-[#333132] px-8 py-3 rounded border border-gray-200 hover:border-maroon transition-colors">
                                    MAKE A DONATION
                                </Link>
                            </div>
                        )}
                    </div>
                );
            case 'debits':
                return (
                    <div className="p-6">
                        <h2 className="text-3xl font-montserrat text-[#333132] mb-6">My Direct Debits</h2>
                        {/* Direct debits content */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-2 py-4 text-sm">
                        <Link to="/" className="text-gray-500 hover:text-maroon transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-[#333132] font-medium">Profile</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-1/4">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                            <div className="bg-gradient-to-br from-maroon to-maroon/90 p-8 text-white">
                                <div className="flex flex-col items-center">
                                    <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/20 shadow-xl">
                                        <User className="w-14 h-14 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-semibold">{donorInfo?.data?.first_name || user?.first_name || 'Loading...'}</h2>
                                    <p className="text-white/90 text-sm mt-2">{donorInfo?.data?.email || user?.email}</p>
                                </div>
                            </div>
                            <nav className="p-4">
                                <ul className="space-y-2">
                                    {menuItems.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => setActiveSection(item.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${activeSection === item.id
                                                        ? 'bg-maroon text-white shadow-lg shadow-maroon/20 translate-y-[-1px]'
                                                        : 'text-[#333132] hover:bg-gray-50 hover:translate-y-[-1px]'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${activeSection === item.id ? 'scale-110' : ''}`} />
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                {typeof item.count === 'number' && (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${activeSection === item.id
                                                            ? 'bg-white text-maroon'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {item.count}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                    <li className="pt-2">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center px-4 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                                        >
                                            <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:rotate-12" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:w-3/4">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 