import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // If the user is logged in, redirect them to the previous page or default page
                const redirectUrl = router.query?.redirect || "/";
                router.push(redirectUrl);  // Redirect to the stored redirect URL
            }
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className=" dark:text-text flex items-center justify-center py-8">
            <form
                onSubmit={handleLogin}
                className="p-8 rounded-xl shadow-lg w-full max-w-md bg-card dark:bg-card border border-border dark:border-dark"
            >
                <h1 className="text-2xl text-text font-bold mb-4 text-center">Login</h1>

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

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-text dark:text-text py-3 rounded-xl"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>

                {/* Links to Register Page */}
                <div className="text-center mt-4">
                    <p className="text-sm">
                        Don&#39;t have an account?{" "}
                        <Link
                            className="text-primary hover:underline"
                            href='/register'
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
