import React, { useState, useEffect, useContext } from "react";
import App from "../data/app.json";
import { openDB, getAllData, getData, deleteKey, addData } from "../utilities/indexedDBUtils";
import { calculateTargetValue, fetchMaterialData, TODAY } from "../utilities/commonUtils";
import FlashCard from "../components/FlashCard";
import Hint from "../components/Hint";
import { SettingsContext } from "../App";
import DailyAchievment from "../components/DailyAchievment";

// indexedDB.deleteDatabase("EnglishFlashCardDB");
const Home = () => {
    
    const { settings, updateSettings } = useContext(SettingsContext);
    const { target, material } = settings;
    const [data, setData] = useState([]);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const [achievements, setAchievements] = useState({ word: 0, sentence: 0});

    useEffect(() => {
        if (!material) {
            console.warn("material の値が不正です。リクエストを送信しません。");
            return;
        }
        const key = `${TODAY}_${settings.material}`;

        // deleteKey("dailyFlashCardScores", key)

        // IndexedDB を初期化
        // openDB("dailyFlashCardScores", 1).then(() => {
        //     fetch(`${App.getData}?userid=${0}&days=60`)
        //         .then(res => res.json())
        //         .then(records => {
        //             if (!records.dailyRecord || records.dailyRecord.length === 0) {
        //                 console.warn("データなし");
        //                 return;
        //             }

        //             const levels = [
        //                 { name: "EXTREME", duration: 1, color: "red" },
        //                 { name: "HARD", duration: 4, color: "orange" },
        //                 { name: "MODERATE", duration: 7, color: "yellow" },
        //                 { name: "EASY", duration: 30, color: "green" }
        //             ];

        //             const idTracker = new Map();
        //             const processedRecords = records.dailyRecord.map(i => {
        //                 if (!i.details || !i.date) {
        //                     console.warn("不正なデータ:", i);
        //                     return null;
        //                 }

        //                 const ids = i.details.split('_')[1].split(',').map(Number).sort((a, b) => a - b);
        //                 const details = ids.map(id => {
        //                     const count = idTracker.get(id) || 0;
        //                     const level = levels[Math.min(count, levels.length - 1)];
        //                     const dueDateTimestamp = new Date(i.date);
        //                     dueDateTimestamp.setDate(dueDateTimestamp.getDate() + level.duration);

        //                     idTracker.set(id, count + 1);
        //                     return { id, level: level.name, dueDate: dueDateTimestamp.toISOString().split("T")[0] };
        //                 });

        //                 return {
        //                     uniqueKey: `${i.date}_${i.material}`, // ✅ ユニークキーを明示的に設定
        //                     date: i.date,
        //                     material: i.material,
        //                     details
        //                 };
        //             }).filter(Boolean);

        //             setDailyRecord(processedRecords);

        //             // IndexedDB に 1 件ずつデータを追加
        //             processedRecords.forEach(record => {
        //                 addData("dailyFlashCardScores", record)
        //                     .then(() => console.log("保存成功:", record.uniqueKey))
        //                     .catch(error => console.error("保存エラー:", error));
        //             });

        //             // データ保存後に全データを取得
        //             setTimeout(() => {
        //                 getData("dailyFlashCardScores")
        //                     .then(storedData => console.log("IndexedDB に保存されたデータ:", storedData))
        //                     .catch(error => console.error("IndexedDB 取得エラー:", error));
        //             }, 2000); // ✅ `setTimeout()` を使い、確実にデータ登録後に取得
        //         });
        // });


        const fetchData = async () => {
            try {
                
                // 🌐 外部データ取得
                const materialData = await fetchMaterialData(material);

                // 💾 IndexedDB のデータ取得・処理
                const scoreData = await getAllData("dailyFlashCardScores", material);
                const finalData = processScoreData(scoreData);
                

                // 📌 データをマッピングして分類
                const dataMap = mapData(finalData);
                const pastMaterials = filterMaterials(materialData, dataMap, item => item.dueDate <= TODAY);
                console.log(TODAY)

                const futureMaterials = filterMaterials(materialData, dataMap, item => item.dueDate > TODAY);
                const undefinedMaterials = materialData.filter(item => !dataMap[item.id]);

                // 🎯 目標数の計算
                const targetNum = calculateTargetValue(App.multiier * target);

                // 🔢 日付順ソート
                sortByDate(pastMaterials, dataMap);
                sortByDate(futureMaterials, dataMap);

                // 📋 コンテンツ作成
                const content = [...pastMaterials, ...undefinedMaterials, ...futureMaterials].slice(0, targetNum);
                
                setData(content);

                const todayAchievement = await getData("dailyFlashCardScores", key);
                if (todayAchievement){
                    const ids = todayAchievement.details.map(item => item.id);
                    const totalWords = materialData
                        .filter(item => ids.includes(item.id)) // ✅ `ids` に含まれる `id` のみ抽出
                        .reduce((sum, item) => sum + item.words, 0); // ✅ `words` を合計
                    setAchievements({ word: totalWords, sentence: ids.length })
                }
            } catch (error) {
                console.error("データ取得エラー:", error);
            }
        };


        const processScoreData = (scoreData) => {
            
            const filteredData = scoreData.flatMap(record => record.details)
                .reduce((acc, item) => {
                    if (acc[item.id]) {
                        acc[item.id].count++;
                        acc[item.id].level = item.level;
                        acc[item.id].dueDate = item.dueDate;
                    } else {
                        acc[item.id] = { ...item, count: 1 };
                    }
                    return acc;
                }, {});
            return Object.values(filteredData);
        };

        const mapData = (finalData) => {
            return finalData.reduce((acc, item) => {
                acc[item.id] = { level: item.level, count: item.count, dueDate: item.dueDate };
                return acc;
            }, {});
        };

        const filterMaterials = (materialData, dataMap, condition) => {
            return materialData
                .filter(item => {
                    return dataMap[item.id] && condition(dataMap[item.id]);
                })
                .map(item => ({
                    ...item,
                    level: dataMap[item.id]?.level || "", // ✅ `level` がない場合はデフォルト値
                    count: dataMap[item.id]?.count || 0, // ✅ `count` がない場合はデフォルト値
                }));
        };

        const sortByDate = (materials, dataMap) => {
            materials.sort((a, b) => new Date(dataMap[a.id].dueDate) - new Date(dataMap[b.id].dueDate));
        };

        fetchData();
    }, [material]);

    const handleSlugUpdate = (slug) => {
        setSelectedSlug(slug);
    };

    const handleDelete = (id) => {
        setTimeout(() => {
            setData(prevData => prevData.filter(item => item.id !== id)); // ✅ ID をもとに削除
            console.log(`削除完了: ${id}`);
        }, 500); // ✅ 0.5秒（500ミリ秒）後に削除
    };

    return (
        <div className="Home">
            <DailyAchievment achievements={achievements}></DailyAchievment>
            {data.length > 0 ? (
                <>
                {achievements.word < target * App.multiier ? (

                        <>
                            {data.map((item) => <FlashCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                onSlugUpdate={handleSlugUpdate}
                                setAchievements={setAchievements}
                            />)}
                            {selectedSlug && <Hint selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} />}
                        </>
                    ) : (
                            <p>Call it for today! See you tomorrow!</p>
                    )
                }
                </>
            ) : (
                <p>No data available. Please check your connection or try again later.</p>
            )}
        </div>
    );
};

export default Home;
