import React, { useState, useContext, useEffect } from "react";
import styles from './../components/css/register.module.css';
import materials from "../data/materials.json";
import { openDB, addData, getData, deleteData } from "../utilities/indexedDBUtils";
import { calculateTargetValue } from "../utilities/commonUtils";
import { SettingsContext } from "../App";
import VocabularyPlanner from "../components/VocabularyPlanner";

import App from "../data/app.json";
import Material from "../data/materials.json";

const Admin = (props) => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [change, setChange] = useState(false);
    const [rate, setRate] = useState(.35);
    
    const required = { basic: "基礎文法", middle: "基本文法", high: "難解な文法", expressions: "レベル不問の文法"}

    useEffect(()=>{
        const getCurrentMaterial = Material.find(i => i.id === settings.material);
        if (settings.lang === undefined || settings.target === undefined) {
            updateSettings(prev => ({ ...prev, lang: `en-US`, target: 50, compositionTarget: 100 }));
        }
        setRate(getCurrentMaterial?.rate|| .35)
    },[settings])

    const handleChangeTarget = (e) => {
        const newValue = Number(e.target.value);
        updateSettings(prev => ({ ...prev, target: newValue }));
    };
    const handleYourNickName = (e) => {
        const newValue = e.target.value;
        updateSettings(prev => ({ ...prev, user: newValue }))
    }
    const handleLang = (e) => {
        updateSettings(prev => ({ ...prev, lang: e.target.value }))
    }
    const handleCompositionTarget = (e) => {
        const newValue = Number(e.target.value);
        updateSettings(prev => ({ ...prev, compositionTarget: newValue }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!change) {
            setChange(true); // 編集モード開始
            return;
        }

        const updatedData = { ...settings, target: settings.target, material: settings.material, lang: settings.lang || `en-US`, user: settings.user, compositionTarget: settings.compositionTarget };

        await addData("settings", updatedData);
        console.log("データが更新されました:", updatedData); // ログでデータの確認

        setChange(false); // 編集モード終了
    };
    const currentMaterial = materials.find(i => i.id === settings.material) || null;

    const deleteHandler = ()=>{
        let result = window.confirm("このページを本当に削除しますか？");
        if(result) {
            indexedDB.deleteDatabase("EnglishFlashCardDB");
            window.location.href = `/welcome/`;
        }
    }
    return (
        <div className="wrapper">
            <h1>設定</h1>
            <div className={styles.form}>
                <dl>
                    <dt>ユーザー名</dt>
                    <dd>
                        {
                            change ?
                                (
                                    <input type="text" value={settings.user} onInput={handleYourNickName} />

                                ) : (
                                    <>{settings.user}</>
                                )
                        }
                        </dd>
                    <dt>言語設定</dt>
                    <dd>
                        {
                            change ?
                            (
                            <select name="" id="" onChange={handleLang}>
                                {
                                    App.languages.map(i => (
                                        <option value={i.id} selected={settings.lang ? i.id === settings.lang: false}>{i.name}</option>
                                ))
                                }
                            </select>

                            ): (
                                    <>{App.languages?.find(i => i.id === settings.lang)?.name}</>
                            )
                        }
                    </dd>
                    <dt>フラッシュカード</dt>
                    <dd>
                        <ul>
                            <li>教材：<br/>
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
                                                            onChange={() => updateSettings((prev) => ({ ...prev, material: item.id }))}
                                                            checked={item.id === settings.material}
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
                                                {settings.material === null || !settings.material ? (
                                                    <>まだ教材を選んでいません。</>
                                                ) : (
                                                    <section className="section">
                                                        <h3>{currentMaterial.name}</h3>
                                                        <p>{currentMaterial.description}</p>
                                                        <div>求められる文法知識<ul>
                                                            {currentMaterial.required
                                                                .filter(key => required.hasOwnProperty(key))
                                                                .map(key => <li key={key}>{required[key]}</li>)}
                                                        </ul></div>
                                                    </section>
                                                )}
                                            </>
                                        )
                                }
                            </li>
                            <li>1日の単語数： {
                                change ? (<input
                                    type="number"
                                    min={0}
                                    max={300}
                                    step={5}
                                    value={settings.target}
                                    onChange={handleChangeTarget}
                                />): (settings.target)}</li>
                            <li>センテンス: {calculateTargetValue(settings.target, rate)}</li>
                        </ul>
                    </dd>
                    <dt>瞬間英作文</dt>
                    <dd>一日の目標: {change ? (
                        <input
                            type="number"
                            min={0}
                            max={300}
                            step={10}
                            value={settings.compositionTarget}
                            onChange={handleCompositionTarget}
                        />
                    ):(settings.compositionTarget)}</dd>
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
            <VocabularyPlanner></VocabularyPlanner>
            <button onClick={deleteHandler} className="btn bg-red">データを完全に削除</button>
          </div>
    );
}

export default Admin;
