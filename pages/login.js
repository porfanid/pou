import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/config";
import Link from "next/link";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (!user.emailVerified) {
                    setShowResend(true);
                } else {
                    const redirectUrl = router.query?.redirect || "/";
                    router.push(redirectUrl);
                }
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setShowResend(false);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setShowResend(true);
                throw new Error("Please verify your email before logging in.");
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (auth.currentUser) {
            try {
                await sendEmailVerification(auth.currentUser);
                alert("Verification email sent!");
            } catch (error) {
                setErrorMessage(error.message);
            }
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setErrorMessage("Please enter your email first.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent!");
            setShowResetModal(false);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="dark:text-text flex items-center justify-center py-8">
            <form
                onSubmit={handleLogin}
                className="p-8 rounded-xl shadow-lg w-full max-w-md bg-card dark:bg-card border border-border dark:border-dark"
            >
                <h1 className="text-2xl text-text font-bold mb-4 text-center">Login</h1>

                <div className="mb-4">
                    <label className="block text-text-muted dark:text-muted mb-2" htmlFor="email">Email</label>
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

                <div className="mb-4">
                    <label className="block text-text-muted dark:text-muted mb-2" htmlFor="password">Password</label>
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
                <p
                    className="text-sm text-primary hover:underline cursor-pointer mb-4"
                    onClick={() => setShowResetModal(true)}
                >
                    Forgot Password?
                </p>

                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4">
                        <p>{errorMessage}</p>
                    </div>
                )}

                {showResend && (
                    <button
                        type="button"
                        onClick={handleResendVerification}
                        className="w-full bg-secondary hover:bg-secondary-hover text-text dark:text-text py-3 rounded-xl mb-2"
                    >
                        Resend Verification Email
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-text dark:text-text py-3 rounded-xl"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>

                <div className="text-center mt-4">
                    <p className="text-sm">
                        Don&#39;t have an account?{" "}
                        <Link className="text-primary hover:underline" href='/register'>
                            Register
                        </Link>
                    </p>
                </div>
            </form>

            {showResetModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-card dark:bg-dark p-6 rounded-xl shadow-lg max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Reset Password</h2>
                        <p className="text-sm text-text-muted mb-4">Enter your email to receive a reset link.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-border rounded-lg mb-4"
                            placeholder="Enter your email"
                        />
                        <button
                            onClick={handleResetPassword}
                            className="w-full bg-primary hover:bg-primary-hover text-text py-2 rounded-lg mb-2"
                        >
                            Send Reset Link
                        </button>
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="w-full bg-gray-300 hover:bg-gray-400 text-text py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
