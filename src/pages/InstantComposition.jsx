import React, { useState, useEffect, useContext,useRef } from 'react';
import styles from '../components/css/InstantComposition.module.css';
import { getData, getAllData, addData, deleteKey } from "../utilities/indexedDBUtils";
import { TODAY } from "../utilities/commonUtils";
import { SettingsContext } from "../App";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";

const InstantComposition = () => {
    const levels = [
        { sec: 7, level: 'Beginner' },
        { sec: 10, level: 'Moderate' },
        { sec: 13, level: 'Hard' },
        { sec: 17, level: 'Extreme' }
    ];
    
    const { settings, updateSettings } = useContext(SettingsContext);
    const [data, setData] = useState([]);
    const [countDown, setCountDown] = useState(0);
    const [isShow, setIsShow] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [selectedTime, setSelectedTime] = useState(0); // 設定した秒数
    const [isStarted, setIsStarted] = useState(false); // スタート状態管理
    const [isFailed, setIsFailed] = useState(false); // スタート状態管理
    const [latestDailyScore, setLatestDailyScore] = useState(null);
    const [allData, setAllData] = useState([])
    const [currentLevel, setCurrentLevel] = useState(levels[0].level)
    const [selectedVoice, setSelectedVoice] = useState(null)
    const counts = useRef({ 'Beginner': 0, 'Moderate': 0, 'Hard': 0, 'Extreme': 0, status: false});
    const [latestDailyScoreDB, setLatestDailyScoreDB] = useState(null);

    //声の設定
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

    //レベルの取得
    useEffect(() => {
        const fetchLatestScoreDB = async () => {
            const latestScore = await getData("instantSentencesDailyScore");
            setLatestDailyScoreDB(latestScore);
        }
        fetchLatestScoreDB();
    },[])

    console.log(`DB`,latestDailyScoreDB)

    //レベルの取得
    useEffect(() => {
        if (rawData.length === 0 || !settings.compositionTarget || !latestDailyScoreDB) return;
        const fetchLatestScore = async () => {
            const rate = settings.compositionTarget / rawData.length;
            const groupedData = levels.reduce((acc, currentLevel) => {
                const level = currentLevel.level;
                const isToday = latestDailyScoreDB?.date === TODAY;
                const mergedData = {
                    totalAttempts: isToday ? latestDailyScoreDB[level]?.totalAttempts: 0,
                    successfulAttempts: isToday ? latestDailyScoreDB[level]?.successfulAttempts : 0,
                    id: latestDailyScoreDB !== undefined ? latestDailyScoreDB[level]?.id : 219,
                }
                const items = rawData.filter(item => item.level === level);
                acc[level] = {
                    total: items.length,
                    target: Math.round(items.length * rate),
                    ...mergedData,
                };
                return acc;
            }, {});
            const data = { date: TODAY, ...groupedData }
            setLatestDailyScore(data);
        };

        fetchLatestScore();
    }, [rawData, settings, latestDailyScoreDB]);
    console.log(`DailyScore`, latestDailyScore)

    //Materialデータの取得
    useEffect(() => {
        fetch(`https://yuririn.github.io/englishmaterial/instant-english-composition.json`)
        .then(res => res.json())
        .then(materialData => {
            setRawData(materialData);
        })
        .catch(error => console.error("Error fetching data:", error));
    }, []);

    //タイマー
    useEffect(() => {
        if (!isStarted || countDown === 0) return;
        const interval = setInterval(() => {
            setCountDown(prev => Math.max(prev - 1, 0));
            if(countDown === 1) {
                setIsFailed(true)
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [countDown, isStarted]);

    useEffect(() => {
        const fetchData = async () => {
            const thisData = await getAllData("instantSentencesScore");
            setAllData(thisData)
        }
        fetchData()
    }, [])

    //タイムアウトの処理
    useEffect(() => {
        if (data.length === 0) return;
        if(isFailed) {
            updateDailyScore(latestDailyScore);
            updateScore({ id: data[counts.current[currentLevel]]?.id, isSuccess: false })
            setIsFailed(false)
        } else {
            return;
        }
    }, [countDown, isStarted, latestDailyScore, currentLevel, data, isFailed]);

    const updateDailyScore = async (data) => {
        
        const levelData = levels.reduce((acc, level)=>{
            acc[level.level] = {
                totalAttempts: data[level.level].totalAttempts,
                successfulAttempts: data[level.level].successfulAttempts,
                id: data[level.level].id
            }
            return acc;
        }, {})
        const newScore = {date: TODAY, ...levelData}
        console.log(newScore)
        await addData("instantSentencesDailyScore", newScore);
    }

    const updateScore = async (atts) => {
        const { id, isSuccess} = atts;
        // ✅ 既存データを取得
        const existingScore = await getData("instantSentencesScore", id);
        const newScore = existingScore
            ? {
                ...existingScore,
                totalAttempts: existingScore.totalAttempts,
                successfulAttempts: isSuccess ? existingScore.successfulAttempts + 1 : existingScore.successfulAttempts
            }
            : { id, totalAttempts: 1, successfulAttempts: isSuccess ? 1 : 0 };

        await addData("instantSentencesScore", newScore);
    }

    const toggleCountDown = () => {
        speechSynthesis.cancel(); // 現在の音声再生を停止
        let tempData;
        setIsFailed(false);
        if (countDown > 0) {
            //成功を追加
            tempData = {
                ...latestDailyScore,
                [currentLevel]: {
                ...latestDailyScore[currentLevel],
                successfulAttempts: latestDailyScore[currentLevel]?.successfulAttempts + 1,
                    id: data[counts.current[currentLevel]]?.id
                }
            }
            setLatestDailyScore(tempData)
            updateDailyScore(tempData);
            updateScore({ id: data[counts.current[currentLevel]]?.id, isSuccess: true})
            setCountDown(0);
        } else {
            if (counts.current.status === false ){
                counts.current.status = true
            } else {
                counts.current[currentLevel] = counts.current[currentLevel]+1
            }
            
            //成功以外を追加
            setLatestDailyScore(prev => ({
                ...prev, [currentLevel]: {
                    ...prev[currentLevel],
                    totalAttempts: prev[currentLevel]?.totalAttempts + 1,
                    id: data[prev[currentLevel]?.totalAttempts + 1]?.id
                }
            }))
            setIsStarted(true);
            setCountDown(selectedTime); // START：カウントダウン開始
        }
        
    };
    
    const levelHandler = (level) => {
       
        if (Object.keys(latestDailyScore).length === 0) return;
        counts.current = { 'Beginner': 0, 'Moderate': 0, 'Hard': 0, 'Extreme': 0, status: false }

        // ✅ `sec` に一致するレベルを取得
        const levelObj = levels.find(item => item.level === level) || levels[levels.length - 1];

        setCurrentLevel(level)
        setSelectedTime(levelObj.sec);
        setIsStarted(false);
        setCountDown(0); // ✅ カウントダウンをリセット
        setIsShow(false); // ✅ 表示状態もリセット

        // ✅ `rawData` から `level` に一致するデータを抽出
        const filteredData = rawData.filter(item => item.level === levelObj.level);

        let rotated = [];
        if (filteredData.findIndex(i => i.id === latestDailyScore[level]?.id) !== -1) {
            let index = filteredData.findIndex(i => i.id === latestDailyScore[level]?.id)
            
            rotated = [
                ...filteredData.slice(index + 1),
                ...filteredData.slice(0, index),
                filteredData.find(i => i.id === latestDailyScore[level]?.id)
            ];
        } else {
            rotated = filteredData;
        }
        //形成したデータを確認
        setData(rotated.slice(0, latestDailyScore[currentLevel]?.target));
        setIsShow(true); // ✅ 必要なら再表示
    };

    console.log(data)

    const play = (text)=> {
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

    //データを取得
    const getAttr = (attr) => {
        return latestDailyScore[currentLevel][attr]
    }
    const achievement = (id) =>{
        const current = allData.find(i=>i.id === id) || []
        const achievementRate = current.id && current?.totalAttempts > 0 ? `${(current?.successfulAttempts / current?.totalAttempts * 100).toFixed(0)} %` : 'Not Yet'; 
        return <li>🏆️: {achievementRate}</li>
    }

    return (
        <div className="wrapper">
            {rawData.length > 0 ? (
                <div className={styles.InstantComposition}>
                    {isShow && (<dl>
                        <dd>{getAttr(`successfulAttempts`)} / {getAttr(`totalAttempts`)} Target: {getAttr(`target`)}</dd>
                    </dl>)}
                    
                    {isShow && (
                        <>{getAttr(`target`) > getAttr(`totalAttempts`) ? (<div className={styles.wrapper}>
                            
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
                                <li>ID:{data[counts.current[currentLevel]]?.id} </li>
                                {achievement(data[counts.current[currentLevel]]?.id)}
                            </ul>)}

                            {isStarted && (
                                <>
                                    <p className={styles.countDown}>{countDown}</p>
                                    <p>{data[counts.current[currentLevel]]?.question}</p>
                                    
                                    {countDown === 0 && (
                                        <div className={styles.answer}>

                                            <p onClick={() => play(data[counts.current[currentLevel]]?.answer)}>🔉 {data[counts.current[currentLevel]]?.answer}</p>
                                            <div className={styles.guide}> <ReactMarkdown remarkPlugins={[remarkGfm, remarkSlug]}>{data[counts.current[currentLevel]]?.tips}</ReactMarkdown></div>
                                        </div>
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
