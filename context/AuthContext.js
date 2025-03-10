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
            console.log("Firebase User:", firebaseUser); // Debugging
            if (firebaseUser&&firebaseUser.emailVerified) {
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

                    console.log("Custom Claims:", data.roles.roles); // Debugging

                    setRoles(data.roles.roles);

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
                        unsubscribeUser = onValue(userRef, async (snapshot) => {
                            userData = snapshot.val();
                            if(!userData){
                                userData = firebaseUser;
                            }
                            userData.claims = data.customClaims;
                            userData.uid = firebaseUser.uid;
                            userData.idToken = await firebaseUser.getIdToken();
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
