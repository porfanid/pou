import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "../firebase/config";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { get, onValue, ref } from "firebase/database";
import Loading from "../components/Loading/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userAuth, setUserAuth] = useState(null);
    const [roles, setRoles] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    async function checkIfReferenceExists(path) {
        const reference = ref(database, path);
        const snapshot = await get(reference);
        return snapshot.exists();
    }

    // Keep track of the ID token
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser((user) => {
                    if (!user) {
                        return user;
                    }
                    return { ...user, idToken: firebaseUser.getIdToken() };
                });
            }
        });
        return () => unsubscribe();
    }, []);

    // Handle auth state changes and fetch user data
    useEffect(() => {
        let unsubscribeUser = () => {};
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && firebaseUser.emailVerified) {
                setUserAuth(firebaseUser);
                const idToken = await firebaseUser.getIdToken(true); // Force refresh to get latest claims

                try {
                    // Get user claims from token
                    const tokenResult = await firebaseUser.getIdTokenResult();
                    const customClaims = tokenResult.claims;

                    // Extract roles from custom claims
                    const userRoles = customClaims.roles||{};

                    console.log("Roles: ",customClaims.roles);


                    // Update roles state
                    setRoles(userRoles);

                    const userPath = `users/${firebaseUser.uid}`;
                    const userExistsInDb = await checkIfReferenceExists(userPath);

                    let userData;

                    if (!userExistsInDb) {
                        userData = {
                            ...firebaseUser,
                            claims: customClaims,
                            uid: firebaseUser.uid,
                            idToken: idToken
                        };
                        setUser(userData);
                    } else {
                        const userRef = ref(database, userPath);
                        unsubscribeUser = onValue(userRef, async (snapshot) => {
                            const newUserData = snapshot.val() || {};

                            // Merge Firebase Auth user data with database data
                            const mergedUserData = {
                                ...newUserData,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                emailVerified: firebaseUser.emailVerified,
                                claims: customClaims,
                                uid: firebaseUser.uid,
                                idToken: idToken
                            };

                            // Only update user if data has changed
                            if (JSON.stringify(user) !== JSON.stringify(mergedUserData)) {
                                setUser(mergedUserData);
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error handling authentication:", error);
                }
            } else {
                setUser(null);
                setRoles(null);
                setNotifications([]);
            }
        });
        setLoading(false);
        return () => {
            unsubscribe();
            unsubscribeUser();
        };
    }, []);

    // Fetch user notifications
    useEffect(() => {
        if (!user) {
            return;
        }

        const notificationsRef = ref(database, `users/${user.uid}/notifications`);
        const unsubscribe = onValue(notificationsRef, (notificationsSnapshot) => {
            const notificationsData = notificationsSnapshot.val();
            const notifications = notificationsData ? Object.values(notificationsData) : [];
            setNotifications(notifications);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={{ user, userAuth, roles, notifications }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);