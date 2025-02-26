'use client'
import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppNavbar from "@/components/AppNavBar";

function AdminPage(): JSX.Element {
    const { user } = useAuthContext() as { user: { uid: string; displayName: string | null; email: string | null; } | null }; // Specify a more accurate type for user
    const router = useRouter();
    // console.log(user)

    useEffect(() => {
        // Redirect to the home Adminpage if the user is not logged in
        if (user == null) {
            router.push("/");
        }
    }, [user, router]); // Include 'router' in the dependency array to resolve eslint warning

    return (
        <div className="relative min-h-screen bg-[#4b5ae4] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>
            <AppNavbar />
            <main className="relative pt-24 pb-24 px-4 sm:px-2 max-w-5xl mx-auto">
                <div className="relative h-[70vh] mb-16">
                    <div className="bg-black/40 backdrop-blur-sm p-4 sm:p-8 text-white">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Admin Dashboard</h1>
                        <div>
                            <h2 className="text-md sm:text-xl font-light sm:font-semibold">Welcome, {user ? user.email : "Guest"}!</h2>
                            <p className="mt-2 sm:mt-4 text-sm sm:text-lg font-light sm:font-normal">Here you can manage your NFTs and view your activity.</p>
                            {/* Additional dashboard features can be added here */}
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}

export default AdminPage;