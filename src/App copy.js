import { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Achievements from "./pages/Achievements";
import Grammar from "./pages/Grammar";
import Admin from "./pages/Admin";
import InstantComposition from "./pages/InstantComposition";
import './styles.css';
import { getData, addData } from "./utilities/indexedDBUtils";

export const SettingsContext = createContext(null);

// function AppRoutes() {
//     const navigate = useNavigate();
//     const [strage, setStrage] = useState({username: null, id: null, target: 0, material: null})

//     // localStorage.removeItem("userInfo")
//     useEffect(() => {
//         const userInfoString = localStorage.getItem("userInfo");

//         if (!userInfoString) {
//             console.log("'userInfo' does not exist. Redirecting to login.");
//             navigate("/login"); // Redirect to login if "userInfo" is empty
//             return;
//         }

//         const userInfo = JSON.parse(userInfoString);

//         setStrage((prev) => ({
//             ...prev,
//             username: userInfo.username,
//             id: userInfo.id,
//             target: userInfo.target !== 0 ? userInfo.target : 0,
//             material: userInfo.material !== null ? userInfo.material : null,
//         }));

//         const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
//         const userTimestamp = userInfo.timestamp;
//         const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds

//         if (currentTimestamp - userTimestamp > sevenDaysInSeconds) {
//             localStorage.removeItem("userInfo"); // Remove expired data
//             setStrage({ username: null, id: null, target: 0, material: null });
//             navigate("/login"); // Redirect to login page
//         }
//     }, [navigate]);


//     const handleLogin =  () => {
//         localStorage.removeItem("userInfo");
//         setStrage({ username: null, id: null, target: 0, material: null })
//         navigate("/login");
//     }

//     return (
//         <div className="App">
//             <main>
//                 <header className="header">
//                     <div>
//                         <h1>Flash Cards</h1>
//                         <p>with Ebbinghaus forgetting curve</p>
//                     </div>
//                     {strage.username === null ? (
//                         <Link to={`/login/`}>Login</Link>
//                     )
//                     : (
//                         <dl>
//                             <dt>{strage.username}</dt>
//                             <dd><button onClick={()=>handleLogin()}>Logout</button></dd>
//                             </dl>
//                     )}
//                 </header>
//                 <Routes>
//                     <Route path="/" element={<Home  strage={strage}/>} />
//                     <Route path="/login/" element={<Login />} />
//                     <Route path="/composition/" element={<InstantComposition />} />
//                     <Route path="/achievements/" element={<Achievements />} />
//                     <Route path="/admin/" element={<Admin strage={strage} setStrage={setStrage} />} />
//                     <Route path="/grammar/" element={<Grammar />} />
//                     <Route path="/grammar/:slug" element={<Grammar />} />
//                 </Routes>
//             </main>

//         </div>
//     );
// }

const AppRoutes = (props) => {
    const { settings, setSettings } = props;
    return (
        <Routes>
            <Route path="/" element={<Home settings={settings}/>} />
            <Route path="/admin/" element={<Admin settings={settings} setSettings={setSettings} />} />
            <Route path="/grammar/" element={<Grammar />} />
            <Route path="/grammar/:slug" element={<Grammar />} />
        </Routes>
    )
}

const App = () => {
    const [settings, setSettings] = useState({ target: 75, material: null });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsData = await getData("settings", 1);
                if (settingsData) {
                    setSettings(settingsData); // ✅ `settings` の初期化を `App.js` で管理
                }
            } catch (error) {
                console.error("データ取得時のエラー:", error);
            }
        };
        fetchSettings();
    }, []);
    const updateSettings = async (newSettings) => {
        await addData("settings", { id: 1, ...newSettings });
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            <Router>
                <div className="App">
                    <main>
                        <Header material={settings.material} />
                        <AppRoutes settings={settings} setSettings={setSettings} /> {/* ✅ `settings` を渡す */}
                    </main>
                    <Nav />
                </div>
            </Router>
        </SettingsContext.Provider>
    );
};

export default App;

const Nav = () => (<nav>
    <ul>
        <li><Link to="/">💪</Link></li>
        <li><Link to="/grammar/">📕</Link></li>
        <li><Link to="/composition/">🚀</Link></li>
        <li><Link to="/achievements/">🏆️</Link></li>
        <li><Link to="/admin/">⚙️</Link></li>
    </ul>
</nav>)

const Header = () => (
    <header className="header">
        <div>
            <h1>Flash Cards</h1>
            <p>with Ebbinghaus forgetting curve</p>
        </div>
    </header>
)
