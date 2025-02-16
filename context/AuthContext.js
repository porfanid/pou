import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { get, onValue, ref } from "firebase/database";
import Loading from "../components/Loading/Loading";  // Import your loading component

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userAuth, setUserAuth] = useState(null);
    const [roles, setRoles] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true); // New loading state

    async function checkIfReferenceExists(path) {
        const reference = ref(database, path);
        const snapshot = await get(reference);
        return snapshot.exists();
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Firebase User:", firebaseUser); // Debugging
            if (firebaseUser) {
                setUserAuth(firebaseUser);
                try {
                    const response = await fetch("/api/getCustomClaims", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ uid: firebaseUser.uid }),
                    });

                    if (!response.ok) throw new Error("Failed to fetch claims");

                    const data = await response.json();
                    console.log("Custom Claims:", data.customClaims); // Debugging

                    const referenceExists = await checkIfReferenceExists(`authors/${firebaseUser.uid}`);
                    const userPath = referenceExists ? `authors/${firebaseUser.uid}` : `users/${firebaseUser.uid}`;
                    const userRef = ref(database, userPath);

                    const unsubscribeUser = onValue(userRef, (snapshot) => {
                        const userData = snapshot.val();
                        userData.claims = data.customClaims;
                        setUser(userData);

                        const rolesRef = ref(database, "roles");
                        onValue(rolesRef, (rolesSnapshot) => {
                            const rolesData = rolesSnapshot.val();

                            const userRoles = {
                                isBand: !!userData.claims.band, // Fixed claims access
                                isAuthor: !!userData.claims.admin, // Fixed claims access
                            };

                            userRoles.isTranslator = rolesData.translationSystem.includes(userData.email);
                            userRoles.isLeader = rolesData.authorLeader.includes(userData.email);
                            userRoles.isAdmin = rolesData.admin.includes(userData.email);
                            userRoles.isCommentAdmin = (rolesData.comments || []).includes(userData.email);

                            setRoles(userRoles);

                            const notificationsRef = ref(database, `/${userRoles.isAuthor ? 'authors' : 'users'}/${userData.uid}/notifications`);
                            onValue(notificationsRef, (notificationsSnapshot) => {
                                const notificationsData = notificationsSnapshot.val();
                                const notifications = notificationsData ? Object.values(notificationsData) : [];
                                setNotifications(notifications);
                            });
                        });
                    });
                    setLoading(false); // Stop loading if no user is authenticated
                    return () => unsubscribeUser(); // ✅ Ensure cleanup
                } catch (error) {
                    console.error("Error fetching custom claims:", error);
                }
            } else {
                setUser(null);
                setRoles({});
                setNotifications([]);
            }
            setLoading(false); // Stop loading if no user is authenticated
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <Loading />; // Show loading component while checking auth state
    }

    return (
        <AuthContext.Provider value={{ user, userAuth, roles, notifications }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
