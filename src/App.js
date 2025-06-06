import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Grammar from "./pages/Grammar";
import Admin from "./pages/Admin";
import Achievements from "./pages/Achievements";
import InstantComposition from "./pages/InstantComposition";
import './styles.css';
import { getData, addData } from "./utilities/indexedDBUtils";
import Welcome from "./pages/Welcome";

export const SettingsContext = createContext(null);

const AppRoutes = (props) => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/" element={<Admin/>} />
            <Route path="/welcome/" element={<Welcome/>} />
            <Route path="/composition/" element={<InstantComposition />} />
            <Route path="/achievements/" element={<Achievements />} />
            <Route path="/achievements/:slug" element={<Achievements />} />
            <Route path="/grammar/" element={<Grammar />} />
            <Route path="/grammar/:slug" element={<Grammar />} />
        </Routes>
    )
}

const App = () => {
    const [settings, setSettings] = useState({ target: 75, material: null, lang: 'en-US', user: null });

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
        <li><Link to="/composition/">🚀</Link></li>
        <li><Link to="/achievements/">🏆️</Link></li>
        <li><Link to="/grammar/">📕</Link></li>
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
