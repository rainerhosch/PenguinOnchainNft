'use client'
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import Navbar from '../../../components/NavBar';
import Footer from '../../../components/Footer';

function DashboardPage(): JSX.Element {
    // Access the user object from the authentication context
    // const { user } = useAuthContext();
    const { user } = useAuthContext() as { user: unknown }; // Use 'as' to assert the type as { user: any }
    const router = useRouter();

    useEffect(() => {
        // Redirect to the home page if the user is not logged in
        if (user == null) {
            router.push("/");
        }
        // }, [ user ] );
    }, [user, router]); // Include 'router' in the dependency array to resolve eslint warning

    return (
        <div className="relative min-h-screen bg-gray-100">
            <Navbar />
            <main className="pt-24 pb-24 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
                    {user ? (
                        <div>
                            <h2 className="text-xl font-semibold">Welcome, {user as string}!</h2>
                            <p className="mt-4">Here you can manage your NFTs and view your activity.</p>
                            {/* Additional dashboard features can be added here */}
                        </div>
                    ) : (
                        <p className="text-red-500">You are not logged in. Please sign in to access your dashboard.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}


export default DashboardPage;
