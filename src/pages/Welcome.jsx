import { useState, useContext, useEffect } from 'react';
import styles from './../components/css/register.module.css';
import { SettingsContext } from "../App";
import { addData, deleteData } from "../utilities/indexedDBUtils";
import { useNavigate, useLocation } from "react-router-dom";  // 🔹 useNavigateを追加
const Welcome = () => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [passCode, setPassCode] = useState(null);
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState({message: null, status: null});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // 🔹 useNavigateを定義
    const location = useLocation();
    const passcodeHandler = (e)=>{
        setNotification({ message: null, status: null })
        const value = e.target.value;
        setPassCode(value);
    }
    const userHandler = (e)=>{
        setNotification({ message: null, status: null })
        const value = e.target.value;
        setUser(value);
    }
    useEffect(() => {
        const fetchData = async () => {
            if (settings === null) return;
            if (settings.passCode !== null && location.pathname === "/welcome/") {
                navigate('/admin/')
            }
        }
    fetchData()
    }, [settings])
    const sendPasscode = async (e)=>{
        if (!passCode || user) {
            setNotification({ message: `必要項目の入力がありません。`, status: `error` })
            return;
        }
        setLoading(true)

        try {
            const response = await fetch(
                `https://script.google.com/macros/s/AKfycbzv4n_oogK0-baf49m9pY1RuTkk5h_iHYi0EkO7PHO52nnZqbPFd6w6dgScBCMIUWh3rA/exec?passCode=${passCode}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log(result);
                if (result.status === `true`) {
                    setNotification({ message: result.message, status: `success` })
                    updateSettings(prev => ({ ...prev, passCode: passCode }))

                    const updatedData = { id: 1, passCode: passCode };
                    await addData("settings", updatedData);
                    navigate("/admin/"); // ✅ Adminページへリダイレクト
                } else {
                    setNotification({ message: result.message, status: `error` })
                    setLoading(false);
                }
            }
        } catch(error){

        }
    }

    return <div className="wrapper">
   
        <div className={styles.form}>
            <p>パスコードとユーザー名を入力してください。</p>
           
            <dl>
                <dt>PASS CODE</dt>
                <dd><input type="text" onInput={passcodeHandler}/></dd>
            </dl>
            {loading && <p style={{textAlign: `center`}}>照合中</p>}
            
            <button className="btn-green" onClick={sendPasscode} disabled={loading || notification.status === `success`}>Send</button>
            {
                notification.message && (
                    <p className={styles.form__alert}>{notification.status === `success` ? `👍️` : `⚠️`}<br />{notification.message}</p>
                )
            }

        </div>
    </div>
}
export default Welcome
