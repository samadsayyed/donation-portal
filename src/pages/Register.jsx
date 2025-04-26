import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            // TODO: Implement actual registration logic here
            toast.success('Registration successful!');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div>
                    <h2 className="text-center text-3xl font-bold text-grey">Sign Up</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your account at Zobia Trust
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 bg-[#F5F8FA] border border-gray-300 placeholder-gray-500 text-grey focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8B0000] hover:bg-[#A52A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            SIGN UP
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        Already have an account? {' '}
                        <Link to="/login" className="font-medium text-[#8B0000] hover:text-[#A52A2A]">
                            Log In Here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register; 