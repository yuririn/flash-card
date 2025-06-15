import React, { useState, useEffect, useContext } from 'react';
import styles from '../components/css/InstantComposition.module.css';
import { getData, getAllData, addData } from "../utilities/indexedDBUtils";
import { TODAY } from "../utilities/commonUtils";
import { SettingsContext } from "../App";

const InstantComposition = () => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [countDown, setCountDown] = useState(0);
    const [isShow, setIsShow] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [selectedTime, setSelectedTime] = useState(0); // 設定した秒数
    const [isStarted, setIsStarted] = useState(false); // スタート状態管理
    const [score, setScore] = useState(0); // スタート状態管理
    const [success, setSuccess] = useState(false); // スタート状態管理
    const [latestDailyScore, setLatestDailyScore] = useState(null);
    const [allData, setAllData] = useState([])
    const [currentLevel, setCurrentLevel] = useState('Beginner')
    const [selectedVoice, setSelectedVoice] = useState(null)

    useEffect(() => {
        const updateVoices = () => {
            const voices = speechSynthesis.getVoices();
            const voicesForLang = voices.filter(v => v.lang === settings.lang);
            setSelectedVoice(voicesForLang.length > 0 ? voicesForLang[voicesForLang.length - 1] : voices[0]); // 確保できなかった場合、最初の音声を使う
        };

        speechSynthesis.onvoiceschanged = updateVoices;
        updateVoices(); // 初回ロード時にも取得

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice, setSelectedVoice]);

    const levels = [
        { sec: 7, level: 'Beginner' },
        { sec: 10, level: 'Moderate' },
        { sec: 13, level: 'Hard' },
        { sec: 17, level: 'Extreme' }
    ];

    useEffect(() => {
        const fetchLatestScore = async () => {
            const latestScore = await getData("instantSentencesDailyScore"); 
            setLatestDailyScore(latestScore);
        };

        fetchLatestScore();
    }, []);

    useEffect(() => {
        fetch(`https://yuririn.github.io/englishmaterial/instant-english-composition.json`)
            .then(res => res.json())
            .then(materialData => {
                setRawData(materialData);
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        if (!isStarted || countDown === 0) return;
        const interval = setInterval(() => {
            setCountDown(prev => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [countDown, isStarted]);

    useEffect(() => {
        const fetchData = async () => {
            const thisData= await getAllData("instantSentencesScore");
            setAllData(thisData)
        }
        fetchData()
    }, [])
    useEffect(() => {
        if(isStarted && countDown === 0) {
            const id = data[count - 1]?.id; 
            const level = data[count - 1]?.level;
            if (id && !success) {
                updateScore(id, level, false); 
            }
            setSuccess(false);
        } else {
            setSuccess(false);
            return;
        }
    }, [countDown, isStarted]);

    const updateDailyScore = async (id, level, isSuccess) => {
        const levelObj = levels.find(item => item.level === level);
        if (!levelObj) return; // ✅ 該当するレベルがない場合は処理しない
        

        const existingDailyScore = await getData("instantSentencesDailyScore", TODAY) || { date: TODAY };

        const levelScore = existingDailyScore[levelObj.level] || { totalAttempts: 0, successfulAttempts: 0 };

        const newLevelScore = {
            totalAttempts: levelScore.totalAttempts + 1,
            successfulAttempts: isSuccess ? levelScore.successfulAttempts + 1 : levelScore.successfulAttempts,
            id: id
        };

        const newDailyScore = { ...existingDailyScore, [levelObj.level]: newLevelScore };

        await addData("instantSentencesDailyScore", newDailyScore);
    };
    console.log(count)

    const updateScore = async (id, level, isSuccess) => {
        // ✅ 既存データを取得
        const existingScore = await getData("instantSentencesScore", id);

        // ✅ データが既存なら更新、なければ新規作成
        const newScore = existingScore
        ? {
            ...existingScore,
            totalAttempts: existingScore.totalAttempts + 1,
            successfulAttempts: isSuccess ? existingScore.successfulAttempts + 1 : existingScore.successfulAttempts
        }
        : { id, totalAttempts: 1, successfulAttempts: isSuccess ? 1 : 0 };

        updateDailyScore(id, level, isSuccess)
        
        await addData("instantSentencesScore", newScore);
    };

    const toggleCountDown = () => {
        speechSynthesis.cancel(); // 現在の音声再生を停止
        if (countDown > 0) {
            setScore(prev => prev + 1);
            setCountDown(0); // STOP：カウントダウンを止める
            const id = data[count-1]?.id;
            const level = data[count-1]?.level;
            setSuccess(true);
            updateScore(id,level, true);
        } else {
            setIsStarted(true);
            setCountDown(selectedTime); // START：カウントダウン開始
            setCount(prev => prev + 1); // 正しく次のカードへ進む
        }
    };

    const levelHandler = (level) => {
        speechSynthesis.cancel();

        // ✅ `sec` に一致するレベルを取得
        const levelObj = levels.find(item => item.level === level) || levels[levels.length - 1];
        

        if (latestDailyScore?.date === TODAY && latestDailyScore[level]) {
            setCount(latestDailyScore[level]?.totalAttempts||0);
            setScore(latestDailyScore[level]?.successfulAttempts || 0);
        } else {
            setCount(0);
            setScore(0);

        }

        setCurrentLevel(level)
        setSelectedTime(levelObj.sec);
        setIsStarted(false);
        setCountDown(0); // ✅ カウントダウンをリセット
        setIsShow(false); // ✅ 表示状態もリセット


        // ✅ `rawData` から `level` に一致するデータを抽出
        const filteredData = rawData.filter(item => item.level === levelObj.level);
        
        // ID に一致する要素を更新
        const updatedData = filteredData.map(item => {
            const match = allData.find(a => {
                return a.id === item.id
            });
            if (match) {
                return {
                    ...item,
                    totalAttempts:  match.totalAttempts,
                    successfulAttempts:  match.successfulAttempts || 0
                };
            }
            return item;
        });


        const targetId = latestDailyScore && latestDailyScore[levelObj.level]?.id ;


        if (targetId){
            const index = updatedData.findIndex(item => item.id === targetId);
            
            // デフォルトで末尾に設定（見つからなかった場合）
            if (index === -1) index = updatedData.length - 1;

            // ✅ スタート位置を循環処理込みで計算
            const startIndex = (index - count + 1 + updatedData.length) % updatedData.length;

            // ✅ 配列を順に並び替える（startIndex → end）
            const reorderedData = [
                ...updatedData.slice(startIndex),
                ...updatedData.slice(0, startIndex),
            ];
            setData(reorderedData);
        }else {
            setData(updatedData);
        }

        setIsShow(true); // ✅ 必要なら再表示
    };

    const play = (text)=> {
        console.log(text)
        try {
            speechSynthesis.cancel(); // 現在の音声再生を停止
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = settings.lang; // 言語設定
            utterance.voice = selectedVoice
            utterance.rate = .7; // 再生速度の設定
            speechSynthesis.speak(utterance); // 再生開始
        } catch (error) {
            console.error("Error while playing audio:", error); // エラー時のログ
        }
    }

    return (
        <div className="wrapper">
            {rawData.length > 0 ? (
                <div className={styles.InstantComposition}>
                    {isShow && (<dl>
                    <dt>Score: {currentLevel}</dt>
                    <dd>{score} / {count} Total: {data.length}</dd>
                    </dl>)}
                    
                    {isShow && (
                        <>{data.length > count ? (<div className={styles.wrapper}>
                            <p className={styles.controll}>
                                {countDown > 0 ? (
                                    <button onClick={toggleCountDown} style={{ backgroundColor: `var(--red)` }} disabled={countDown <= 1 && true}>
                                        STOP
                                    </button>

                                ) : (
                                    <button onClick={toggleCountDown} style={{ backgroundColor: `var(--green)` }}>
                                        START
                                    </button>

                                )}
                            </p>
                            {isStarted && (<ul>

                                <li>ID:{data[count - 1]?.id} </li>
                                <li>🏆️: {data[count - 1]?.totalAttempts ? `${(data[count - 1]?.successfulAttempts !== 0 ? (data[count - 1]?.successfulAttempts / data[count - 1]?.totalAttempts * 100).toFixed(0) : 0)}%` : 'NOT YET'}</li>
                            </ul>)}

                            {isStarted && (
                                <>
                                    <p className={styles.countDown}>{countDown}</p>
                                    <p>{data[count - 1]?.question}</p>
                                    {countDown === 0 && (
                                        <p className={styles.answer} onClick={() => play(data[count - 1]?.answer)}>🔉 {data[count - 1]?.answer}</p>
                                    )}
                                </>
                            )}
                        </div>) : (<div className={styles.wrapper}><h2>DONE</h2></div>)}
                        </>
                    )}

                    
                    <ul className={styles.nav}>
                        {levels.map(({ sec, level }) => (
                            <li key={level}>
                                <button onClick={() => levelHandler(level)} className={level === currentLevel || `current`}>{sec} SEC</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <>データはありません。</>
            )}
        </div>
    );
};

export default InstantComposition;
