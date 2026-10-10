import { useAuthStore } from "../store/authStore";

function Navbar() {
    const { user, logout } = useAuthStore();

    const goTo = (path: string) => {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">SmartCart</div>

            <div className="navbar-links">
                <button onClick={() => goTo("/")}>Home</button>

                {!user && (
                    <>
                        <button onClick={() => goTo("/signin")}>Sign In</button>
                        <button onClick={() => goTo("/signup")}>Sign Up</button>
                    </>
                )}

                {user && user.role === "ADMIN" && (
                    <button onClick={() => goTo("/admin")}>
                        Admin Dashboard
                    </button>
                )}

                {user && (
                    <>
                        <span className="welcome-user">
                            Welcome, {user.name}
                        </span>
                        <button onClick={logout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
