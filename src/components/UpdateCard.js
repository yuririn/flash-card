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
    const [detail, setDetail] = useState(null)
    const levels = App.levels;
    const key = `${TODAY}_${settings.material}`;

    const handleUpdate = (lv) => {
        speechSynthesis.cancel(); // 再生を停止
    
        const updateDate = new Date();
        updateDate.setDate(updateDate.getDate() + (levels.find(i => i.name === lv)?.durition || 1));

        const formattedDate = updateDate.toISOString().split("T")[0];
            
        const data = { id: id, level: lv, dueDate: formattedDate }
        setDetail(data)
            

    };
    const handleConfirm = async ()=>{
        let data = await getData("dailyFlashCardScores", key);
        if (!data) {
            // ✅ データが存在しない場合、新規作成
            data = { uniqueKey: key, date: TODAY, material: settings.material, details: [detail] };
            await addData("dailyFlashCardScores", data);
        } else {
            data = { ...data, details: [...data.details, detail]}
            await addData("dailyFlashCardScores", data);
        }
        setAchievements(prev => ({ word: prev.word + words, sentence: prev.sentence + 1}))
        setIsHidden(true);
        onDelete(id);
        setDetail(false);
    }

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
            {
                detail && (
                    <div className={styles.confirm}>
                        <div>
                            <p>ID {id} の次回表示日時を {detail.dueDate} で確定します。</p>
                            <button onClick={handleConfirm}>YES</button>
                            <button onClick={()=>setDetail(false)}>NO</button>
                        </div>
                    </div>

                )
            }
        </div>
    );
};

export default UpdateCard;
