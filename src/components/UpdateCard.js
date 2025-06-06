import React, { useState, useRef, useEffect, useContext } from "react";
import styles from './css/Flashcard.module.css';
import App from "../data/app.json";
import { SettingsContext } from "../App";
import { getData, addData } from "../utilities/indexedDBUtils";

import {  TODAY } from "../utilities/commonUtils";

const UpdateCard = (props) => {
    const { level, id, words, count, onDelete, setIsHidden, setAchievements } = props;
    const { settings, updateSettings } = useContext(SettingsContext);
    const [selectedLevel, setSelectedLevel] = useState(level || "EXTREME");
    const [currentCount, setCurrentCount] = useState(count);
    const levels = App.levels;
    const key = `${TODAY}_${settings.material}`;

    const handleUpdate = async (lv) => {
        speechSynthesis.cancel(); // 再生を停止
    
        const updateDate = new Date();
        updateDate.setDate(updateDate.getDate() + (levels.find(i => i.name === lv)?.durition || 1));

        const formattedDate = updateDate.toISOString().split("T")[0];

        try {
            let data = await getData("dailyFlashCardScores", key);
            const detail = { id: id, level: lv, dueDate: formattedDate }
            if (!data) {
                // ✅ データが存在しない場合、新規作成
                data = { uniqueKey: key, date: TODAY, material: settings.material, details: [detail] };
                await addData("dailyFlashCardScores", data);
            } else {
                data = { ...data, details: [...data.details, detail]}
                await addData("dailyFlashCardScores", data);
            }
            console.log(words)
            setAchievements(prev => ({ word: prev.word + words, sentence: prev.sentence + 1}))
            setIsHidden(true);
            onDelete(id);
        } catch (error) {
            console.error("データ取得エラー:", error);
        }
    };

    return (
        <div>
            <dl className={styles.level}>
                <dt>STATUS <span>{currentCount}</span></dt>
                <dd>
                    <ul>
                        {levels
                            .map((l, i) => {
                                const isCurrent = l.name === selectedLevel ? 'current' : '';
                                
                                return (
                                    <li className={isCurrent} key={i}>
                                        <button
                                            className={`btn-${l.color}`}
                                            onClick={() => handleUpdate(l.name)}
                                        >
                                            {l.name}
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                </dd>
            </dl>            
        </div>
    );
};

export default UpdateCard;
