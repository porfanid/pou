import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "./PulseOfTheUnderground_800x800.jpg";
import {useAuth} from "../../context/AuthContext";

const AppNavigation = () => {
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [articlesDropdownOpen, setArticlesDropdownOpen] = useState(false);
    const {user, roles, notifications} = useAuth();


    useEffect(() => {
        if (user) {
            const unreadCount = notifications.filter(notification => !notification.read).length;
            setUnreadNotificationsCount(unreadCount);
        } else {
            setUnreadNotificationsCount(0);
        }
    }, [user, notifications]);

    return (
        <nav className="sticky top-0 bg-[#100000] shadow-lg shadow-[#200000] z-50">
            <div className="container mx-auto p-4 flex justify-between items-center">
                <Link className="text-xl font-bold text-gray-300 tracking-widest uppercase drop-shadow-lg" href="/">
                    <div className="relative">
                        <Image
                            className="rounded-full shadow-xl shadow-[#600000] z-50"
                            src={logo}
                            alt={"Pulse Of The Underground"}
                            width={100}
                            height={100}
                        />
                    </div>
                </Link>


                <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={28} /> : <Menu  size={28} />}
                </button>

                <div className={`md:flex md:items-center md:space-x-6 absolute md:relative top-10 md:top-0 w-full md:w-auto bg-[#100000] md:bg-transparent left-0 px-6 md:px-0 ${menuOpen ? 'block mt-20' : 'hidden'}`}>
                    <Link className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2" href="/">
                        Home
                    </Link>

                    {/* Articles Dropdown with Improved Hover Behavior */}
                    <div
                        className="relative"
                        onMouseEnter={() => setArticlesDropdownOpen(true)}
                        onMouseLeave={() => setTimeout(() => setArticlesDropdownOpen(false), 500)}
                    >
                        <button className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2">
                            Articles
                        </button>
                        <div
                            className={`absolute ${articlesDropdownOpen ? 'block' : 'hidden'} bg-gray-900 border border-gray-700 p-2 shadow-xl rounded-lg mt-2 transition-opacity duration-200`}
                        >
                            {user && (
                                <Link className="block text-gray-300 hover:text-red-500 p-2" href="/user/saved">
                                    Saved Articles
                                </Link>
                            )}
                            <Link className="block text-gray-300 hover:text-red-500 p-2" href="/article">
                                All Articles
                            </Link>
                            {roles&&roles.author && (
                                <Link className="block text-gray-300 hover:text-red-500 p-2" href="/article/upload">
                                    Upload
                                </Link>
                            )}
                            {roles&&roles.author && (
                                <Link className="block text-gray-300 hover:text-red-500 p-2" href="/article/admin">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    {roles&&roles.admin && (<Link className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2" href="/author/admin">
                            Users
                        </Link>)}

                    {roles&&roles.comments && (<Link className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2" href="/comments">
                        Comments
                    </Link>)}


                    <Link className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2" href="/youtube">
                        Youtube Videos
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button className="flex items-center text-gray-400 hover:text-red-600 transition-all duration-300"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {user.photoURL?<Image height={100} width={100} src={user.photoURL}
                                        alt="Profile"
                                        className={`w-10 h-10 rounded-full ${user.photoURL && "border-2"} border-gray-600 shadow-lg`}/>:<span className="block md:inline text-gray-400 hover:text-red-600 transition-all duration-300 py-2">Profile</span>}
                                {unreadNotificationsCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full px-1 shadow-lg">
                                        {unreadNotificationsCount}
                                    </span>
                                )}
                            </button>
                            <div className={`absolute right-0 bg-gray-900 border border-gray-700 p-2 shadow-xl rounded-lg mt-2 transition-opacity duration-200 ${dropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                 onMouseEnter={() => setDropdownOpen(true)}
                                 onMouseLeave={() => setDropdownOpen(false)}>
                                <Link className="block text-gray-300 hover:text-red-500 p-2" href="/user/profile">
                                    <strong>{user.displayName}</strong>
                                </Link>
                                <Link className="block text-gray-300 hover:text-red-500 p-2" href="/user/notifications">
                                    Notifications {unreadNotificationsCount > 0 && (<span className="text-red-500">({unreadNotificationsCount})</span>)}
                                </Link>
                                <button onClick={() => signOut(auth)} className="block w-full text-gray-300 bg-red-700 hover:bg-red-800 transition-all duration-300 p-2 text-center rounded-lg">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link className="block md:inline p-2 rounded-lg text-gray-400 hover:text-red-600 bg-red-900 transition-all duration-300" href="/auth/login">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AppNavigation;
