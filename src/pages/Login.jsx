import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import useSessionId from '../hooks/useSessionId';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const sessionId = useSessionId();

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.success) {
                setUser(data.donor);
                toast.success(data.message || 'Login successful!');
                // Navigate to the redirect path or home
                const redirectPath = '/profile';
                navigate(redirectPath, { replace: true });
            } else {
                toast.error(data.message || 'Login failed');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Login failed');
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        loginMutation.mutate({
            email: formData.email,
            password: formData.password,
            session_id: sessionId
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div>
                    <h2 className="text-center text-3xl font-bold text-grey">Log In</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        You can use your email address to log in
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                            disabled={loginMutation.isLoading}
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
                            disabled={loginMutation.isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                disabled={loginMutation.isLoading}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-grey">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary">
                                Forget Password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loginMutation.isLoading}
                        >
                            {loginMutation.isLoading ? 'Logging in...' : 'LOG IN'}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        Not registered? {' '}
                        <Link to="/signup" className="font-medium text-primary hover:text-primary">
                            Sign Up Here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 