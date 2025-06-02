import React, { useState, useEffect } from 'react';
import styles from '../components/css/InstantComposition.module.css';

const InstantComposition = () => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [countDown, setCountDown] = useState(0);
    const [isShow, setIsShow] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [selectedTime, setSelectedTime] = useState(0); // 設定した秒数
    const [isStarted, setIsStarted] = useState(false); // スタート状態管理
    const [score, setScore] = useState(0); // スタート状態管理

    // 配列をランダムに並べ替える関数
    const shuffleArray = (array) => {
        return [...array].sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        fetch(`https://yuririn.github.io/englishmaterial/instant-english-composition.json`)
            .then(res => res.json())
            .then(materialData => {
                setRawData(materialData);
                setData(shuffleArray(materialData.filter(item => item.words < 6))); // 初期データをランダム化
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

    const toggleCountDown = () => {
        speechSynthesis.cancel(); // 現在の音声再生を停止
        if (countDown > 0) {
            setScore(prev => prev + 1);
            setCountDown(0); // STOP：カウントダウンを止める
        } else {
            setIsStarted(true);
            setCountDown(selectedTime); // START：カウントダウン開始
            setCount(prev => prev + 1); // 正しく次のカードへ進む
        }
    };

    const levelHandler = (sec) => {
        speechSynthesis.cancel(); // 現在の音声再生を停止
        setCount(0); // 初期化
        setSelectedTime(sec);
        setIsStarted(false); // 変更時にスタート状態をリセット
        setScore(0);

        let filteredData;
        if (sec === 7) {
            filteredData = rawData.filter(item => item.words <= 5);
        } else if (sec === 10) {
            filteredData = rawData.filter(item => item.words > 5 && item.words <= 9);
        } else if (sec === 13) {
            filteredData = rawData.filter(item => item.words > 9 && item.words <= 14);
        } else {
            filteredData = rawData.filter(item => item.words > 14);
        }

        setData(shuffleArray(filteredData));
        setIsShow(true);
    };
    const play = (text)=> {
        console.log(text)
        try {
            speechSynthesis.cancel(); // 現在の音声再生を停止
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // 言語設定
            utterance.rate = .7; // 再生速度の設定
            speechSynthesis.speak(utterance); // 再生開始
        } catch (error) {
            console.error("Error while playing audio:", error); // エラー時のログ
        }
    }

    return (
        <div className="wrapper">
            {data.length > 0 ? (
                <div className={styles.InstantComposition}>
                   <dl>
                    <dt>Score</dt>
                    <dd>{score} / {count}</dd>
                   </dl>

                    {isShow && (
                        <div className={styles.wrapper}>
                            <p className={styles.controll}>
                                {countDown > 0 ? (
                                    <button onClick={toggleCountDown} style={{ backgroundColor: `var(--red)` }} disabled={countDown <= 1 && true}>
                                        STOP
                                    </button>

                                ):(
                                    <button onClick={toggleCountDown} style={{ backgroundColor: `var(--green)`}}>
                                        START
                                    </button>

                                )}
                            </p>

                            {isStarted && (
                                <>
                                    <p className={styles.countDown}>{countDown}</p>
                                    <p>{data[count]?.question}</p>
                                    {countDown === 0 && (
                                        <p className={styles.answer} onClick={() => play(data[count]?.answer)}>🔉 {data[count]?.answer}</p>
                                        )}
                                </>
                            )}
                        </div>
                    )}
                    <ul className={styles.nav}>
                        <li><button onClick={() => levelHandler(7)}>7 SEC</button></li>
                        <li><button onClick={() => levelHandler(10)}>10 SEC</button></li>
                        <li><button onClick={() => levelHandler(13)}>13 SEC</button></li>
                        <li><button onClick={() => levelHandler(17)}>17 SEC</button></li>
                    </ul>
                </div>
            ) : (
                <>データはありません。</>
            )}
        </div>
    );
};

export default InstantComposition;
