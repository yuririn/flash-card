import React, { useState } from "react";
import styles from './../components/css/register.module.css';

const VocabularyPlanner = () => {
    const [goal, setGoal] = useState(5000); // 目標語彙数
    const [duration, setDuration] = useState(180); // 期間（日数）
    const [dailyWords, setDailyWords] = useState(null);

    const calculateWordsPerDay = () => {
        const totalReviews = goal * 5;
        const dailyReviews = totalReviews / duration;
        const wordsPerDay = dailyReviews / 5;

        setDailyWords(Math.ceil(wordsPerDay)); // 切り上げ
    };

    return (
        <div className={styles.form}>
            <h2>語彙学習プランナー</h2>
            <p>目標の語彙数と学習期間を入力すると、1日に覚えるべき単語数を自動で計算できます。効率的な学習計画の立案に役立ちます！</p>
            <dl>
                <dt>

                <label>
                    目標語彙数
                    </label>
                </dt>
                <dd>
                    <input
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(Number(e.target.value))}
                        min="1"
                    />
                </dd>
                <dt>

                <label>
                    期間（日数）
                    </label>
                </dt>
                <dd>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min="1"
                    />
                </dd>
            </dl>
            <button onClick={calculateWordsPerDay} className="btn-green">計算</button>
            {dailyWords !== null && (
                <p style={{fontSize: `24px`, textAlign: 'center'}}>1日あたりの学習語数: <strong>{dailyWords} 語</strong></p>
            )}
        </div>
    );
};

export default VocabularyPlanner;
