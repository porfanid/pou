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
        const exists = snapshot.exists();
        console.log(exists)
        return exists;
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
                    const userPath = `users/${firebaseUser.uid}`;

                    const userExistsInDb = await checkIfReferenceExists(userPath);

                    let userData;
                    let unsubscribeUser=()=>{};

                    if(!userExistsInDb){
                        userData = firebaseUser;
                        userData.claims = data.customClaims;
                        userData.uid = firebaseUser.uid;
                        setUser(userData);
                    }else {
                        const userRef = ref(database, userPath);
                        unsubscribeUser = onValue(userRef, (snapshot) => {
                            userData = snapshot.val();
                            userData.claims = data.customClaims;
                            userData.uid = firebaseUser.uid;
                            setUser(userData);
                        });
                    }

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


    useEffect(() => {
        if(!user){
            return;
        }
        const rolesRef = ref(database, "roles");
        return onValue(rolesRef, (rolesSnapshot) => {
            const rolesData = rolesSnapshot.val();

            const userRoles = {
                isBand: !!user.claims.band, // Fixed claims access
                isAuthor: !!user.claims.admin, // Fixed claims access
            };

            userRoles.isTranslator = rolesData.translationSystem.includes(user.email);
            userRoles.isLeader = rolesData.authorLeader.includes(user.email);
            userRoles.isAdmin = rolesData.admin.includes(user.email);
            userRoles.isCommentAdmin = (rolesData.comments || []).includes(user.email);
            userRoles.isMerchAdmin = (rolesData.merch || []).includes(user.email);

            setRoles(userRoles);

            const notificationsRef = ref(database, `users/${user.uid}/notifications`);
            onValue(notificationsRef, (notificationsSnapshot) => {
                const notificationsData = notificationsSnapshot.val();
                const notifications = notificationsData ? Object.values(notificationsData) : [];
                setNotifications(notifications);
            });
        });
    }, [user]);




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
