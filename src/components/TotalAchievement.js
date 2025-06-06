import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import { fetchMaterialData } from "../utilities/commonUtils";
import { getAllData } from "../utilities/indexedDBUtils";
import styles from "../components/css/Archievments.module.css";
import App from '../data/app.json'
import { createPieChart } from "../utilities/chartUtils";
const TotalAchievement = ({slug})=> {
    const { settings, updateSettings } = useContext(SettingsContext);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [total, setTotal] = useState({sentence: 0, word: 0, level: {}}) 
    const [totalComposition, setTotalComposition] = useState({}) 

    const levels = ['Beginner','Moderate','Hard','Extreme'];

    useEffect(() => {
            if (!settings.material) {
                return;
            }
            const fetchData = async () => {
                try {
                    const materialData = await fetchMaterialData(settings.material);
                    const scoreData = await getAllData("dailyFlashCardScores", settings.material);
                    const idsMap = scoreData.flatMap(i => i.details)
                        .reduce((acc, d) => {
                            acc[d.id] = { id: d.id, level: d.level }; // `id` ごとに最新の `level` を保持
                            return acc;
                        }, {});
    
                    const ids = Object.values(idsMap); // `idsMap` のオブジェクトを配列に変換
    
                    const total = materialData
                        .filter(item => ids.some(obj => obj.id === item.id))
                        .map(item => {
                            const matchedObj = ids.find(obj => obj.id === item.id);
                            return { ...item, level: matchedObj.level }; // `item` に `level` を追加
                        });
    
                    const levelCounts = Object.fromEntries(
                        Object.entries(
                            total.reduce((acc, item) => {
                                acc[item.level] = (acc[item.level] || 0) + 1;
                                return acc;
                            }, {})
                        ).sort(([, a], [, b]) => b - a) // カウントの多い順に並び替え
                    );
    
                    const totalWords = total
                        .reduce((sum, item) => sum + (item.words || 0), 0);
                    
                    
    
                    setTotal({ sentence: ids.length, word: totalWords, level: levelCounts });
    
                     if (chartRef.current) {
                         createPieChart(chartRef, chartInstanceRef, levelCounts);
                    }
                    const allDailyComposition = await getAllData("instantSentencesDailyScore");
                    const aggregatedData = allDailyComposition.reduce((acc, item) => {
                        Object.entries(item).forEach(([level, stats]) => {
                            if (level !== "date") {
                                if (!acc[level]) {
                                    acc[level] = { totalAttempts: 0, successfulAttempts: 0 };
                                }
                                acc[level].totalAttempts += stats.totalAttempts;
                                acc[level].successfulAttempts += stats.successfulAttempts;
                            }
                        });
                        return acc;
                    }, {});
                    setTotalComposition(aggregatedData)
                } catch(error) {
    
                }
            }
            fetchData();
        }, [settings, setTotal])
    
    return (
    <>
        {!slug ? (
            <dl className={styles.archievments_total}>
                <dt>🏆️<br />TOTAL ACHIEVEMENTS of {settings.material}</dt>
                <dd>SENTENCES <span>{total.sentence || 0}</span></dd>
                <dd>
                    COMPREHENSION
                    <div>
                        <canvas ref={chartRef} width="100"
                            hight="100"></canvas>
                    </div>
                </dd>
                <dd>WORDS <span>{total.word || 0}</span></dd>
            </dl>
        ):(
            <dl className={styles.archievments_compositionTotal}>
                <dt>🏆️<br />TOTAL ACHIEVEMENTS of Instant Conposition</dt>
                {levels.map(key => (
                    <dd key={key}>
                        <dl>
                            <dt>{key}</dt>
                                <dd><strong>{totalComposition[key]? ((totalComposition[key]?.successfulAttempts ) / (totalComposition[key]?.totalAttempts ) * 100).toFixed(0):0}</strong> %</dd>
                        </dl>
                    </dd>
                ))} 
            </dl>
        )}
        
    </>)
}
export default TotalAchievement;
