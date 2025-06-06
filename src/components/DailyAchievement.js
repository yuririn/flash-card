import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import { fetchMaterialData } from "../utilities/commonUtils";
import { getAllData } from "../utilities/indexedDBUtils";
import styles from "../components/css/Archievments.module.css";
import App from '../data/app.json'
import TotalAchievement from "./TotalAchievement";
const DailyAchievement = ({slug})=> {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [total, setTotal] = useState({sentence: 0, word: 0, level: {}}) 
    const [totalComposition, setTotalComposition] = useState({})
    const [param, setParam] = useState(3);

    const levels = !slug ? App.levels : ['Beginner', 'Moderate', 'Hard', 'Extreme'];

    useEffect(() => {

        if (!settings.material ) return;
        
        const fetchDailyData = async () => {
            try {
                const materialData = await fetchMaterialData(settings.material);
                const allData = await getAllData("dailyFlashCardScores", settings.material);

                // 🔹 降順ソートして `param` 件取得 & `words` を追加
                const filteredData = allData
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // ✅ 日付降順ソート
                    .slice(0, param)
                    .map(i => ({
                        date: i.date,
                        details: i.details.map(detail => {
                            const words = materialData.find(k => detail.id === k.id).words;
                            return { ...detail, words: words }
                        })
                    }));
                
                setTotal(filteredData)

                const allDailyComposition = await getAllData("instantSentencesDailyScore");
                console.log(allDailyComposition)
                setTotalComposition(allDailyComposition)
            } catch (error) {
                console.error("Error fetching daily data:", error);
            }
        };

        fetchDailyData();
    }, [param, settings]);
    
    return (
    <>
        <ul className={styles.archievments_controlls}>
            {[
                { label: "3 DAYS", value: 3 },
                { label: "7 DAYS", value: 7 },
                { label: "2 WEEKS", value: 14 },
                { label: "1 MONTH", value: 30 },
            ].map((button) => (
                <li key={button.value}>
                    <button
                        onClick={() => setParam(button.value)}
                        className={param === button.value ? styles.active : ""}

                    >
                        {button.label}
                    </button>
                </li>
            ))}
        </ul>
        {!slug ? (
                <table>
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>SENTENCES</th>
                            <th>WORDS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {total.length > 0 &&
                            (
                                total.map(item => {
                                    const levelCounts = item.details.reduce((acc, item) => {
                                        acc[item.level] = (acc[item.level] || 0) + 1; // ✅ `level` ごとのアイテム数をカウント
                                        return acc;
                                    }, {});

                                    const totalWords = item.details.reduce((acc, detail) => acc + detail.words, 0);

                                    const maxLevel = Object.entries(levelCounts).reduce((max, [level, count]) =>
                                        count > max.count ? { level, count } : max,
                                        { level: null, count: -Infinity } // ✅ 初期値を設定
                                    );

                                    return (
                                        <tr key={item.date}>
                                            <th>{item.date}</th>
                                            <td className={styles.archievments_sentences}>
                                                <span>Total: {item.details.length}</span>
                                                <dl>
                                                    {levels.map((level) => {
                                                        const percentage = ((levelCounts[level.name] / (maxLevel.count || 0)) * 100).toFixed(3);

                                                        return (
                                                            <div key={level.name}>
                                                                <dt>{level.name}: {levelCounts[level.name] || 0}</dt>
                                                                <dd key={level.name} style={{ width: `${percentage}%` }} className={`bg-${level.color}`} // 安全参照
                                                                    data-tooltip={level.name} > </dd>
                                                            </div>
                                                        )
                                                    })}
                                                </dl>
                                            </td>
                                            <td className={styles.archievments_idioms}>
                                                <span>Total: {totalWords}</span>
                                                {(totalWords / settings.target * 100).toFixed(2)} % {totalWords < 75 ? (
                                                    <ul className={styles.unsuccess}>
                                                        <li style={{ width: `${totalWords / 75 * 100}%` }}></li>
                                                    </ul>
                                                ) : (
                                                    <ul className={styles.success}>
                                                        <li style={{ width: `${settings.target / totalWords * 100}%` }}>
                                                        </li>
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )
                        }
                    </tbody>
                </table>
        ):(
            <table>
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>LEVEL</th>
                        <th>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {totalComposition.length>0 && 
                        (totalComposition.map(item =>{
                            const totals = Object.values(item).reduce((acc, category) => {
                                if (category.totalAttempts !== undefined && category.successfulAttempts !== undefined) {
                                    acc.totalAttempts += category.totalAttempts;
                                    acc.successfulAttempts += category.successfulAttempts;
                                }
                                return acc;
                            }, { totalAttempts: 0, successfulAttempts: 0 });

                            const totalAchieve = (totals.successfulAttempts / totals.totalAttempts * 100).toFixed(2)
                            console.log(totals);
                        return (<tr key={item.date}>
                            <th>{item.date}</th>
                            <td className={styles.archievments_sentences}>
                                <dl>
                                    {levels.map((level) => {
                                        const color = level === 'Beginner' ? 'green' :App.levels.find(i => level.toUpperCase() === i.name)?.color
                                        const parcentage = item[level] ?(item[level]?.successfulAttempts / item[level]?.totalAttempts * 100).toFixed(1) : 0
                                        return (
                                        <div key={level}>
                                                <dt>{level}: {parcentage}%</dt>
                                                <dd style={{ width: `${parcentage}%` }} className={`bg-${color}`} // 安全参照
                                            data-tooltip={level.name} > </dd>
                                    </div>)}
                                )}
                                </dl>
                            </td>
                            <td className={styles.archievments_idioms}>
                                <span>{totals.successfulAttempts} / {totals.totalAttempts}</span>
                                <ul className={totalAchieve > 75 ? styles.success : styles.unsuccess}>
                                    <li style={{ width: `${totalAchieve}%` }}></li>
                                </ul>
                            </td>
                        </tr>)
                        }
                        ))
                    }
                </tbody>
            </table>
        )}
        
    </>)
}
export default DailyAchievement;
