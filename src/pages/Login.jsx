import React, { useState } from "react";
import styles from './../components/css/register.module.css';
import RegisterForm from "../components/RegisterForm";
import Unvisible from "../components/svg/Unvisible";
import Visible from "../components/svg//Visible";
import { useNavigate } from "react-router-dom"; // useNavigateをインポート

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(true); // true: ログイン画面, false: 新規登録画面

    const userInfo = localStorage.getItem("userInfo");

    const toggleScreen = () => {
        setIsLogin(!isLogin);
    };

    return (
        <>
        {userInfo === null ? (
            <div className="App">
                <main>
                    <header className="header">
                        <div>
                            <h1>Flash Cards</h1>
                            <p>with Ebbinghaus forgetting curve</p>
                        </div>
                    </header>
                    <div className="wrapper">
                    <h2>{isLogin ? "Login（ログイン）" : "Register（新規登録）"}</h2 >
                    {isLogin ? <LoginForm /> : <RegisterForm />
                    }
                    <ul className={styles.nav}>
                        <li><button onClick={toggleScreen} disabled={isLogin} className="bg-green">
                            ログイン
                        </button></li>
                        <li>
                            <button onClick={toggleScreen} disabled={!isLogin} className="bg-pink">
                                新規登録
                            </button>
                        </li>
                    </ul>
                    </div>
                </main>
            </div>
        ) : (
            <div className="wrapper">
                <h2>{ isLogin? "Login（ログイン）": "Register（新規登録）" }</h2 >
                        { isLogin?<LoginForm /> : <RegisterForm />
                }
                <ul className={styles.nav}>
                    <li><button onClick={toggleScreen} disabled={isLogin} className="bg-green">
                        ログイン
                    </button></li>
                    <li>
                        <button onClick={toggleScreen} disabled={!isLogin} className="bg-pink">
                            新規登録
                        </button>
                    </li>
                </ul> 
            </div>
        )}
       </>
    );
};

const LoginForm = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({ username: "", password: "" }); // 初期値を空文字列に変更
    const [isDisabled, setIsDisabled] = useState(true); // ボタン無効化の初期状態
    const [showPassword, setShowPassword] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);

    // フィールドの値を更新
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));

        // ボタン有効化の条件をチェック
        setIsDisabled(!(e.target.form.username.value && e.target.form.password.value));
    };

    const handleLogin = async (e) => {
        e.preventDefault(); // デフォルト動作の防止
        setIsLoading(true)
        console.log(userInfo)
        try {
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbzCkEBP-UfC8qNtwAJPm4ql7dwet1NF39TDqtN93u4nDBgIPuen7Ig_r-4FvPF6EPE4/exec",
                {
                    method: "POST",
                    body: JSON.stringify({ ...userInfo, isLogin: true }),
                }
            );
            if (response.ok) {
                const result = await response.json();
                console.log(result)
                if (result.status === `success`) {
                    const getUserInfo = result?.userInfo
                    const userInfo = {
                        username: getUserInfo?.username,
                        id: getUserInfo?.id,
                        timeStamp: Math.floor(Date.now() / 1000),
                        material: getUserInfo?.material,
                        target: getUserInfo?.target, // strage.materialを更新
                    };
                    // Function to save user information in localStorage
                    localStorage.setItem("userInfo", JSON.stringify(userInfo))
                    navigate('/')
                    
                } else {

                }
                setIsLoading(false)
            }
            // 必要に応じてレスポンスを処理
        } catch (error) {
            console.error("Fetch error:", error);
            setIsLoading(false)
        }
    };
    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev); // Toggle main password
    };

    return (
        <form className={styles.form} onSubmit={handleLogin}>
            <p></p>
            <dl>
                <dt>
                    <label htmlFor="username">Username</label>
                </dt>
                <dd>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value={userInfo.username}
                        onChange={handleChange} // 値を追跡
                        disabled={isLoading}
                    />
                </dd>
                <dt>
                    <label htmlFor="password">Password</label>
                </dt>
                <dd>
                    <div className={styles.password}>
                    <input
                        type={showPassword ? "text" : "password"} // 
                        id="password"
                        name="password"
                        required
                        value={userInfo.password}
                        onChange={handleChange} // 値を追跡
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={handleTogglePasswordVisibility}
                        style={{
                            marginLeft: "8px",
                            padding: "4px 8px",
                            cursor: "pointer",
                        }}
                    >
                        {showPassword ? (<Visible />) : (<Unvisible />)}
                    </button>
                    </div>
                </dd>
            </dl>
            <button
                type="submit"
                className="btn-red"
                disabled={isDisabled} // ボタンの状態を制御
            >
                Login
            </button>
        </form>
    );
};


export default LoginRegister;
