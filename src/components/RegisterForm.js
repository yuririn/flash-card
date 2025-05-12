import React, { useState } from "react";
import styles from './../components/css/register.module.css';
import Unvisible from "./svg/Unvisible";
import Visible from "./svg/Visible";
import { useNavigate } from "react-router-dom"; // useNavigateをインポート

const RegisterForm = () => {
    const [formValues, setFormValues] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        secretQuestion: "",
        secretAnswer: "",
    });
    const [registeredValues, setRegisteredValues] = useState({status: null, message: '', id: null});
    const [registering, setRegistering] = useState(false);

    console.log(formValues)

    const [showPassword, setShowPassword] = useState(false); // Main password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Confirm password visibility
    const [errors, setErrors] = useState({});
    const [isDisabled, setIsDisabled] = useState(true);
    const [touchedFields, setTouchedFields] = useState({}); // Track touched fields

    const navigate = useNavigate(); // navigate関数を取得

    const validate = () => {
        const newErrors = {};
        const idRegex = /^[A-Za-z0-9]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        const maxSecretAnswerLength = 10;

        if (touchedFields.username && !idRegex.test(formValues.username)) {
            newErrors.username = "ユーザー名はアルファベットと数字のみです。";
        }
        if (touchedFields.password && !passwordRegex.test(formValues.password)) {
            newErrors.password = "パスワードは、8文字以上で、大文字、小文字、数字、記号を含む必要があります。";
        }
        if (touchedFields.confirmPassword && formValues.password !== formValues.confirmPassword) {
            newErrors.confirmPassword = "パスワードが一致しません";
        }
        if (touchedFields.secretAnswer && formValues.secretAnswer.length > maxSecretAnswerLength) {
            newErrors.secretAnswer = `秘密の質問の回答は10文字までです。 (現在 ${formValues.secretAnswer.length}).`;
        }
        setErrors(newErrors);

        setIsDisabled(Object.keys(newErrors).length > 0);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setTouchedFields({ ...touchedFields, [name]: true });
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev); // Toggle main password
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev); // Toggle confirm password
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsDisabled(true)
        setRegistering(true)
        if (Object.keys(errors).length === 0) {
            
            try {
                const response = await fetch(
                    "https://script.google.com/macros/s/AKfycbwdTKxVlfCJF28qMLZn0C1Svw4gkqqNpP4jCQNF1cgG33o3JSNT9Vz1JbxDHWGLQ4Oj/exec",
                    { method: "POST", body: JSON.stringify(formValues) }
                );
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === `error`) {
                        setRegisteredValues((prev) => ({
                                ...prev,
                                status: 'error',
                                message: "すでに同じ名前の登録者が存在します。"
                            })
                        )
                        setIsDisabled(false)
                    }else {
                        setRegisteredValues((prev) => ({
                            ...prev,
                            id: result.id,
                            status: 'success',
                            message: "登録完了"
                        })
                        )
                        const userInfo = {
                            username: formValues.username,
                            id: result.id,
                            timeStamp: Math.floor(Date.now() / 1000)
                        };
                        

                        // Function to save user information in localStorage
                        localStorage.setItem("userInfo", JSON.stringify(userInfo))

                        navigate("/admin/"); // ここでリダイレクト
                    }
                    console.log("Update successful:", result);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {

            }
        }
    };

    return (
        <>
            <form className={styles.form} onChange={validate}>
                {registeredValues.status !== 'success' && 
                (<dl>
                    <dt>
                        <label>ユーザー名</label>
                    </dt>
                    <dd>
                        <input
                            type="text"
                            name="username"
                            value={formValues.username}
                            onChange={handleChange}
                            required
                            disabled={registering}
                        />
                        {errors.username && <p style={{ color: `var(--red)` }}>{errors.username}</p>}
                    </dd>

                    <dt>
                        <label>Password</label>
                    </dt>
                    <dd>
                        <div className={styles.password}>
                            <input
                                type={showPassword ? "text" : "password"} // Main password field
                                name="password"
                                value={formValues.password}
                                onChange={handleChange}
                                required
                                disabled={registering}
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
                                {showPassword ? ( <Visible/> ) : (<Unvisible />)}
                            </button>
                        </div>
                        {errors.password && <p style={{ color: `var(--red)` }}>{errors.password}</p>}
                    </dd>

                    <dt>
                        <label>Password（確認）</label>
                    </dt>
                    <dd>
                        <div className={styles.password}>
                            <input
                                type={showConfirmPassword ? "text" : "password"} // Confirm password field
                                name="confirmPassword"
                                value={formValues.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={registering}
                            />
                            <button
                                type="button"
                                onClick={handleToggleConfirmPasswordVisibility}
                                style={{
                                    marginLeft: "8px",
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                }}
                            >
                                {showConfirmPassword ? (<Visible />) : (<Unvisible />)}
                            </button>
                        </div>
                        {errors.confirmPassword && <p style={{ color: `var(--red)` }}>{errors.confirmPassword}</p>}
                    </dd>

                    <dt>秘密の質問</dt>
                    <dd>
                        <ul>
                            <li>
                                <label>
                                    <input
                                        type="radio"
                                        name="secretQuestion"
                                        value="0"
                                        onChange={handleChange}
                                        disabled={registering}
                                    />
                                    親の旧姓は？
                                </label>
                            </li>
                            <li>
                                <label>
                                    <input
                                        type="radio"
                                        name="secretQuestion"
                                        value="1"
                                        onChange={handleChange}
                                        disabled={registering}
                                    />
                                    昔飼っていたペットの名前は？
                                </label>
                            </li>
                            <li>
                                <label>
                                    <input
                                        type="radio"
                                        name="secretQuestion"
                                        value="2"
                                        onChange={handleChange}
                                        disabled={registering}
                                    />
                                    初恋の人の名前は？
                                </label>
                            </li>
                            <li>
                                <label>
                                    <input
                                        type="radio"
                                        name="secretQuestion"
                                        value="3"
                                        onChange={handleChange}
                                        disabled={registering}
                                    />
                                    思い出に残っている旅行の場所は？
                                </label>
                            </li>
                        </ul>
                        答え
                        <input
                            type="text"
                            name="secretAnswer"
                            value={formValues.secretAnswer}
                            onChange={handleChange}
                            disabled={registering}
                            required
                        />
                        {errors.secretAnswer && <p style={{ color: `var(--red)` }}>{errors.secretAnswer}</p>}
                    </dd>
                </dl>)
                }
                {

                    registeredValues.status !== null && (<>
                        {registeredValues.status === 'error'?
                            (<p style={{ color: `var(--red)`,textAlign:`center` }}>{registeredValues.message}</p>)
                            : (
                            <><p style={{ color: `var(--green)`, textAlign: `center` }}>{registeredValues.message}</p>
                                <dl>
                                    <dt>ID</dt>
                                    <dd>{registeredValues.id}</dd>
                                    <dt>ユーザー名</dt>
                                    <dd>{formValues.username}</dd>
                                </dl>
                            </>)
                        }
                    </>)
                }
                {registeredValues.status !== 'success' && <button type="submit" className="btn-red" onClick={handleSubmit} disabled={isDisabled}>Register</button>}
            </form>
        </>
    );
};

export default RegisterForm;
