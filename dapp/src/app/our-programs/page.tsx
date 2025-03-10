import React from 'react';
import HomeIcon from '@mui/icons-material/Home';

const OurProgramsPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-700 to-purple-900 p-8">
            <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-2xl sm:text-2xl font-bold mb-4 text-white animate-fade-in">Our Programs</h1>
                <p className="text-lg text-purple-200 mb-8 animate-fade-in delay-100 text-justify sm:mx-10">
                    At Pengo, we believe in the power of collaboration and community engagement. Our programs foster creativity, innovation, and inclusivity, empowering users to shape the future of our platform.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-5xl mx-auto animate-fade-in-up sm:mx-10">
                {/* Collaboration Programs */}
                <div className="bg-purple-600 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                    <h2 className="text-2xl font-semibold text-white mb-3">Collaboration Programs</h2>
                    <p className="text-purple-200">
                        Join forces with artists and creators to craft unique accessories for Pengo NFTs. Participate in workshops, contests, and showcases to bring your ideas to life and gain exposure.
                    </p>
                </div>

                {/* DAO Voting System */}
                <div className="bg-purple-600 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                    <h2 className="text-2xl font-semibold text-white mb-3">DAO Voting System</h2>
                    <p className="text-purple-200">
                        Be part of the decision-making process! Our DAO system lets community members vote on new accessory designs, ensuring a fair and transparent selection process.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 animate-fade-in-up sm:mx-10">
                <div className="bg-purple-600 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                    <h2 className="text-2xl font-semibold text-white mb-3 text-center">Join Us</h2>
                    <p className="text-purple-200 text-center">
                        {`Whether you're an artist, a community member, or simply curious, there’s a place for you in Pengo. Shape the future with us and be part of something bigger!`}
                    </p>
                </div>
            </div>

            {/* Floating Back to Home Button */}
            <a href="/" className="fixed bottom-8 right-8 p-2 bg-purple-400 border border-white text-white rounded-full shadow-lg hover:bg-purple-950 transition">
                <HomeIcon/>
            </a>
        </div>
    );
};

export default OurProgramsPage;
