import React, { useState } from "react";
import styles from './../components/css/register.module.css';
import materials from "../data/materials.json";

function Admin({ strage, setStrage }) {
    const { id, username, target, material } = strage; // strageから直接取得
    const [change, setChange] = useState(false);

    // ターゲット変更処理
    const handleChangeTarget = (e) => {
        const newTarget = e.target.value; // 入力値を取得
        setStrage((prev) => ({
            ...prev,
            target: newTarget, // strage.targetを更新
        }));
    };

    // 教材変更処理
    const handleChangeMaterial = (e) => {
        const newMaterial = e.target.value; // 入力値を取得
        setStrage((prev) => ({
            ...prev,
            material: newMaterial, // strage.materialを更新
        }));
    };

    // 現在の教材を取得
    const currentMaterial = materials.find(item => item.id === material);

    // 設定保存処理
    const handleSubmit = async (e) => {
        e.preventDefault(); // デフォルトのフォーム送信を無効化

        if (change) {
            try {
                const response = await fetch(
                    "https://script.google.com/macros/s/AKfycbzEKfoFrmVrVzOUJLkXkRnNaZmZ-PbRyfdXCMSCyCeVpI9xUQxfGolHbOfVF7wPM4cY/exec",
                    {
                        method: "POST",
                        body: JSON.stringify({ id, target, material }) // strageから直接送信
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.status === "success") {
                        const updatedInfo = {
                            ...JSON.parse(localStorage.getItem("userInfo")),
                            target,
                            material
                        };

                        // 親コンポーネントを更新
                        setStrage(updatedInfo);

                        // ローカルストレージを更新
                        localStorage.setItem("userInfo", JSON.stringify(updatedInfo));

                        // 編集モード終了
                        setChange(false);
                    }
                    console.log("Update successful:", result);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        } else {
            setChange(true); // 編集モード開始
        }
    };
    const required = { basic: "基礎文法", middle: "基本文法", high: "難解な文法", expressions: "レベル不問の文法"}


    return (
        <div className="wrapper">
            <h1>設定</h1>
            <div className={styles.form}>
                <dl>
                    <dt>ユーザー名</dt>
                    <dd>{username}</dd>
                    <dt>目標</dt>
                    <dd>
                        <ul>
                            <li>
                                1日の単語数: {
                                    change ?
                                        (
                                            <input
                                                type="number"
                                                min={0}
                                                max={300}
                                                step={5}
                                                value={target} // strage.targetを直接使用
                                                onChange={handleChangeTarget}
                                            />
                                        ) : (
                                            <span>{target? target: 0}</span>
                                        )
                                }
                            </li>
                            <li>センテンス: {Math.round((target ? target : 0) * 0.35 / 10) * 10}</li>
                        </ul>
                    </dd>
                    <dt>使用する教材</dt>
                    <dd>
                        {
                            change ?
                                (
                                    <ul className={styles.material}>
                                        {materials.map((item) => (
                                            <li key={item.id}>
                                                
                                                <input
                                                    type="radio"
                                                    value={item.id}
                                                    id={item.id}
                                                    onChange={handleChangeMaterial}
                                                    checked={item.id === material}
                                                />
                                                <label htmlFor={item.id}>
                                                    <section className="section">
                                                    <h3>{item.name}</h3>
                                                    <p>{item.description}</p>
                                                        <div>求められる文法知識
                                                        <ul>
                                                            {item.required
                                                                .filter(key => required.hasOwnProperty(key)) 
                                                                .map(key => <li key={key}>{required[key]}</li>)}
                                                        </ul>
                                                    </div>
                                                    </section>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <>
                                        {material === null || !material? (
                                            <>まだ教材を選んでいません。</>
                                        ) : (
                                            <section className="section">
                                                <h3>{currentMaterial?.name}</h3>
                                                <p>{currentMaterial?.description}</p>
                                                <div>求められる文法知識<ul>
                                                        {currentMaterial?.required
                                                        .filter(key => required.hasOwnProperty(key))
                                                        .map(key => <li key={key}>{required[key]}</li>)}
                                                    </ul></div>
                                            </section>
                                        )}
                                    </>
                                )
                        }
                    </dd>
                </dl>
                {!change ?
                    (
                        <button onClick={handleSubmit} className="btn-green">変更</button>
                    ) : (
                        <div className={styles.btns}>
                            <button onClick={handleSubmit} className="btn-red">保存</button>
                            <button onClick={() => setChange(false)} className="btn-gray">キャンセル</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default Admin;
