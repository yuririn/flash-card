import React, { useState, useRef, useEffect } from "react";
import styles from './css/Flashcard.module.css';
import Draggable from "react-draggable";
import App from "../data/app.json";
import { updateDailyRecord } from "../utilities/updateDailyRecord";
import { updateMaterialRecord } from "../utilities/updateMaterialRecord";

const UpdateCard = ({ currentLevel, count, id, setAchievements, removeCard, onUpdate, wordsTotal }) => {
    const deviceHeight = window.innerHeight; // デバイスの高さを取得
    const threshold = (deviceHeight / 2) * 0.7; // デバイスの高さの70%を計算
    const nodeRef = useRef(null); // ドラッグ対象の要素
    const [timeoutId, setTimeoutId] = useState(null); // タイマーIDを管理
    const [isShow, setIsShow] = useState(false); // コンテンツ表示状態
    const [selectedLevel, setSelectedLevel] = useState(currentLevel); // 現在のレ
    // ベルを管理
    const [currentCount, setCurrentCount] = useState(count); // 現在のカウントを管理
    const [swipeDirection, setSwipeDirection] = useState(""); // スワイプ方向を管理

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [updateData, setUpdateData] = useState({materialRecord: {}, dailyRecord: {} });


    const levels = App.levels;

    let updateCounter = 0; // 更新回数をカウント

    const handleUpdate = async (level, skip = false) => {
        setUpdateData({ materialRecord: {}, dailyRecord: {} })
        updateCounter++; // 呼ばれるたびにカウント

        setAchievements(prev => {

            return {
                ...prev,
                sentence: (prev.sentence ?? 0) + 1, // ✅ `undefined` を防ぐ
                word: (prev.word ?? 0) + wordsTotal // ✅ `undefined` の場合は初期値 0 を使用
            };
        });

        onUpdate(id);
        Promise.all([
            fetch(`${App.getData}?userid=${userInfo.id}&days=1`).then(res => res.json()),
            fetch(`https://yuririn.github.io/englishmaterial/${userInfo.material}.json`).then(res => res.json())
        ])
            .then(([result, material]) => {
                if (!result || !material) {
                    console.log("データが取得できませんでした");
                    return;
                }

                const materialData = updateMaterialRecord(result, userInfo, id, level, skip, material, count);
                const dailyData = updateDailyRecord(result, userInfo, id, level);
                console.log(dailyData)

                if (materialData) setUpdateData(prev => ({ ...prev, materialRecord: materialData }));
                if (dailyData) setUpdateData(prev => ({ ...prev, dailyRecord: dailyData }));
            })
            .catch(() => {
                
            });
        
    };


    // ✅ `updateData` の変更後の状態を監視
    useEffect(() => {
        if (updateData.materialRecord?.materialId || updateData.dailyRecord?.date) {
            //保存は非同期で処理
            // ✅ fetch によるデータ更新処理
            const sendUpdate = async () => {
                try {
                    const response = await fetch(`${App.updateData}`, {
                        method: "POST",
                        body: JSON.stringify({ userId: userInfo.id, ...updateData}),
                    });

                    const result = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    removeCard(id)
                    console.log("Update successful:", result);

                } catch (error) {
                    console.error("データ送信エラー:", error);
                }
            }
            sendUpdate();
        }
    }, [updateData, userInfo.id]); // ✅ `updateData` の変更を検知

    const handleDragStart = () => {
        if (timeoutId) {
            clearTimeout(timeoutId); // 既存タイマーをクリア
        }

        const id = setTimeout(() => {
            console.log("No action detected for 2 seconds. Resetting isShow to false.");
            setIsShow(false); // コンテンツ非表示
        }, 2000); // 2秒
        setTimeoutId(id);
    };

    const handleDrag = (e, data) => {
        if (data.deltaY < 0) {
            setSwipeDirection("up"); // 上にスワイプ中
        } else if (data.deltaY > 0) {
            setSwipeDirection("down"); // 下にスワイプ中
        }
    };

    const handleDragStop = (e, data) => {
        console.log("Drag stopped at position:", data.y);

        if (data.y <= -threshold) {
            console.log("Triggered DONE");
            setIsShow(false);
            handleUpdate("DONE"); // DONE の処理
        } else if (data.y >= threshold) {
            console.log("Triggered SKIP");
            setIsShow(false);
            handleUpdate(currentLevel, true); // SKIP の処理
        }

        setSwipeDirection(""); // リセット
    };

    return (
        <div>
            <dl className={styles.level}>
                <dt>STATUS{currentCount !== 0 && (<span>{currentCount}</span>)}</dt>
                <dd>
                    <ul>
                        {levels
                            .filter(level => level.name !== "DONE")
                            .map((level, i) => {
                                const isCurrent = level.name === selectedLevel ? 'current' : '';
                                return (
                                    <li className={isCurrent} key={i}>
                                        <button
                                            className={`btn-${level.color}`}
                                            onClick={() => handleUpdate(level.name)}
                                        >
                                            {level.name}
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                </dd>
                <button onClick={() => setIsShow(!isShow)}>OTHERS</button>
            </dl>
            <div className={isShow ? 'isShow otherControll' : 'otherControll'}>
                <Draggable
                    axis="y"
                    bounds={{ top: -deviceHeight / 2, bottom: deviceHeight / 2 }}
                    onStart={handleDragStart}
                    onDrag={handleDrag} // スワイプ方向の検出
                    onStop={handleDragStop}
                    nodeRef={nodeRef}
                >
                    <div ref={nodeRef} className="draggableContainer">
                        <p style={{ color: swipeDirection === "up" && "var(--red)"}}>
                            <strong>DONE</strong>
                            <small>This has completely been memorized!</small>
                        </p>
                        <p style={{ color: swipeDirection === "down" && "var(--green)"}}>
                            <strong>SKIP</strong>
                            <small>This will be tried tomorrow.</small>
                        </p>
                    </div>
                </Draggable>
            </div>
        </div>
    );
};

export default UpdateCard;
