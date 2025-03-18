import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "../firebase/config";
import {onAuthStateChanged, onIdTokenChanged} from "firebase/auth";
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
        console.log("Path: ",path);
        const snapshot = await get(reference);
        const exists = snapshot.exists();
        console.log(exists)
        return exists;
    }

    useEffect(()=>{
        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            setUser((user)=>{
                if(!user) {
                    return user;
                }
                return {...user, idToken:firebaseUser.getIdToken()};
            })//await firebaseUser.getIdToken();
        });
        return ()=>unsubscribe();
    },[])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && firebaseUser.emailVerified) {
                setUserAuth(firebaseUser);
                const idToken = await firebaseUser.getIdToken();
                try {
                    const response = await fetch("/api/getCustomClaims", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${idToken}`
                        },
                        body: JSON.stringify({ uid: "Empty" }),
                    });

                    if (!response.ok) throw new Error("Failed to fetch claims");

                    const data = await response.json();
                    const newRoles = data.roles.roles;

                    // Only update roles if they have changed
                    if (JSON.stringify(roles) !== JSON.stringify(newRoles)) {
                        setRoles(newRoles);
                    }

                    const userPath = `users/${firebaseUser.uid}`;
                    const userExistsInDb = await checkIfReferenceExists(userPath);

                    let userData;
                    let unsubscribeUser = () => { };

                    if (!userExistsInDb) {
                        userData = { ...firebaseUser, claims: data.customClaims, uid: firebaseUser.uid };
                        setUser(userData);
                    } else {
                        const userRef = ref(database, userPath);
                        unsubscribeUser = onValue(userRef, async (snapshot) => {
                            const newUserData = snapshot.val() || firebaseUser;
                            newUserData.claims = data.customClaims;
                            newUserData.uid = firebaseUser.uid;
                            newUserData.idToken = await firebaseUser.getIdToken();

                            // Only update user if data has changed
                            if (JSON.stringify(user) !== JSON.stringify(newUserData)) {
                                setUser(newUserData);
                            }
                        });
                    }

                    setLoading(false); // Stop loading if no user is authenticated
                    return () => unsubscribeUser(); // Ensure cleanup
                } catch (error) {
                    console.error("Error fetching custom claims:", error);
                }
            } else {
                setUser(null);
                setRoles({});
                setNotifications([]);
                setLoading(false); // Stop loading if no user is authenticated
            }
        });
        return () => unsubscribe();
    }, [roles]);


    useEffect(() => {
        if(!user){
            return;
        }

        const notificationsRef = ref(database, `users/${user.uid}/notifications`);
        onValue(notificationsRef, (notificationsSnapshot) => {
            const notificationsData = notificationsSnapshot.val();
            const notifications = notificationsData ? Object.values(notificationsData) : [];
            setNotifications(notifications);
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
