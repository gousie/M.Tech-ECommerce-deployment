
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import CartCount from "./components/CartCount";
import Signup from "./pages/SignupPage";
import Signin from "./pages/SigninPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setPath(window.location.pathname);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const setPage = (page: string) => {
        const newPath = page === "admin" ? "/admin" : "/user";

        window.history.pushState({}, "", newPath);
        setPath(newPath);
    };

    return (
        <>
            <Navbar />

            <main className="container">
                {path === "/signup" && <Signup />}

                {path === "/signin" && <Signin setPage={setPage} />}

                {path === "/admin" && <AdminDashboard />}

                {path === "/user" && <UserDashboard />}

                {path === "/" && (
                    <>
                        <CartCount />
                        <ProductList />
                    </>
                )}
            </main>
        </>
    );
}

export default App;
