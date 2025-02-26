"use client";

import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { signIn, signWithGoogle } from "@/app/firebase/auth/signIn";
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const [isSignIn] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const router = useRouter();

    // Handle form submission
    const handleForm = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
            // console.log(error);
            toast.error('Sign in failed or invalid-credential');
            return;
        }
        // Sign in successful
        // console.log(result);
        // Redirect to the admin page
        router.push("/admin");
    }


    const handleGoogleSignIn = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        const { error } = await signWithGoogle();
        if (error) {
            // console.log(error);
            toast.error('Google sign in failed or invalid-credential');
            return;
        }
        // console.log(result);
        toast.success('Google sign in successful!');
        router.push("/admin");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    return (
        <div className="relative min-h-screen bg-[#4b5ae4] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>

            <Toaster position="top-center" />

            <main className="relative pt-24 pb-24 px-4 sm:px-2 max-w-md mx-auto">
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 sm:p-8">
                    <h1 className="text-3xl font-bold mb-3 text-black text-center">Login</h1>
                    <h4 className="text-1xl font-semibold mb-0 text-black/40 text-center">Eight Gallery</h4>

                    <form onSubmit={handleForm} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            {isSignIn ? "Sign in" : "Sign up"}
                        </button>
                    </form>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/40 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-200 border border-gray-300"
                        >
                            Continue with Google
                        </button>
                    </div>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <button onClick={() => window.location.href = '/signup'} className="text-blue-600 hover:text-blue-700">
                        Sign up here
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
}
