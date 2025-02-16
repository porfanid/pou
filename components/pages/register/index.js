import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useRouter } from "next/router";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import RulesModal from "../../RulesModal";
import {useAuth} from "../../../context/AuthContext"; // Make sure to import the modal

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileName, setProfileName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [redirectTo, setRedirectTo] = useState("/");

    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    const router = useRouter();

    const {user} = useAuth();

    useEffect(() => {
        if (user) {
            // If the user is logged in, redirect them to the previous page or default page
            const redirectUrl = router.query?.redirect || "/";
            router.push(redirectUrl.toString()).then();  // Redirect to the stored redirect URL
        }
    }, [user]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: profileName,
            });

            router.push(redirectTo); // Redirect to previous page after successful registration
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark:text-text flex items-center justify-center py-8">
            <form
                onSubmit={handleRegister}
                className="p-8 rounded-xl shadow-lg w-96 bg-card dark:bg-card border border-border dark:border-dark"
            >
                <h1 className="text-2xl font-bold mb-4">Register</h1>

                {/* Profile Name Field */}
                <div className="mb-4">
                    <label className="block text-text-muted dark:text-muted mb-2" htmlFor="profileName">
                        Profile Name
                    </label>
                    <input
                        id="profileName"
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full p-3 bg-background dark:bg-background text-text dark:text-text border border-border dark:border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
                        placeholder="Enter your profile name"
                        required
                    />
                </div>

                {/* Email Field */}
                <div className="mb-4">
                    <label className="block text-text-muted dark:text-muted mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-background dark:bg-background text-text dark:text-text border border-border dark:border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                {/* Password Field */}
                <div className="mb-4">
                    <label className="block text-text-muted dark:text-muted mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-background dark:bg-background text-text dark:text-text border border-border dark:border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4">
                        <p>{errorMessage}</p>
                    </div>
                )}

                {/* Register Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-text-light dark:text-text-light py-3 rounded-xl"
                >
                    {isLoading ? "Registering..." : "Register"}
                </button>

                {/* Rules Agreement Message */}
                <div className="text-sm text-center mt-4">
                    <p>
                        By registering, you agree to our{" "}
                        <span
                            onClick={() => setIsModalOpen(true)}
                            className="text-primary cursor-pointer hover:underline"
                        >
                            Community Rules
                        </span>.
                    </p>
                </div>

                {/* Links to Login Page */}
                <div className="text-center mt-4">
                    <p className="text-sm">
                        Already have an account?{" "}
                        <Link className="text-primary hover:underline" href="/login">
                            Login here
                        </Link>
                    </p>
                </div>
            </form>

            {/* Rules Modal */}
            <RulesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
