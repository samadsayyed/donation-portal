import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/authApi';

const Signup = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const signupMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            if (data.success) {
                setUser(data.donor);
                toast.success(data.message || 'Registration successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'An error occurred during registration');
        },
    });

    const onSubmit = (data) => {
        signupMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-grey">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-grey">
                    Or{' '}
                    <Link to="/login" className="font-medium text-maroon hover:text-customBeige transition-colors">
                        sign in to your account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg border border-gray-100 sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-grey">
                                First Name *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="first_name"
                                    type="text"
                                    autoComplete="given-name"
                                    {...register('first_name', {
                                        required: 'First name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'First name must be at least 2 characters'
                                        }
                                    })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maroon focus:border-maroon sm:text-sm"
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-maroon">{errors.first_name.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-grey">
                                Last Name *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="last_name"
                                    type="text"
                                    autoComplete="family-name"
                                    {...register('last_name', {
                                        required: 'Last name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Last name must be at least 2 characters'
                                        }
                                    })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maroon focus:border-maroon sm:text-sm"
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-maroon">{errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="user_email" className="block text-sm font-medium text-grey">
                                Email address *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="user_email"
                                    type="email"
                                    autoComplete="email"
                                    {...register('user_email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maroon focus:border-maroon sm:text-sm"
                                />
                                {errors.user_email && (
                                    <p className="mt-1 text-sm text-maroon">{errors.user_email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="user_password" className="block text-sm font-medium text-grey">
                                Password *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="user_password"
                                    type="password"
                                    autoComplete="new-password"
                                    {...register('user_password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        }
                                    })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-maroon focus:border-maroon sm:text-sm"
                                />
                                {errors.user_password && (
                                    <p className="mt-1 text-sm text-maroon">{errors.user_password.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting || signupMutation.isPending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon hover:bg-customBeige focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-customBeige disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {(isSubmitting || signupMutation.isPending) ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup; 