import React, { useState, useEffect, useRef } from "react";
import FlashCard from "../components/FlashCard";
import LoadingContent from "../components/LoadingContent";
import Hint from "../components/Hint";
import DailyAchievment from "../components/DailyAchievment";
import App from "../data/app.json";
import { processQuizData } from "../utilities/processQuizData";

const Home = ({ strage }) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [data, setData] = useState([]);
    const [achievements, setAchievements] = useState({ word: 0, sentence: 0, material: undefined });
    const [selectedSlug, setSelectedSlug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const isFetchedFlashcard = useRef(false); // ✅ フラグを追加

    const handleSlugUpdate = (slug) => {
        setSelectedSlug(slug);
    };

    useEffect(() => {
        Promise.all([
            fetch(`${App.getData}?userid=${userInfo.id}&days=1`).then(res => res.json()),
            fetch(`https://yuririn.github.io/englishmaterial/${userInfo.material}.json`).then(res => res.json())
        ])
        .then(([result, material]) => {
            setAchievements({ word: 0, sentence: 0, material: userInfo.material || `N/A` });
            if (!result || !material) {
                console.log("データが取得できませんでした");
                return;
            }
            const dailyRecord = result?.dailyRecord?.find(i => i.material === userInfo.material) || null;
            const todaysRecord = dailyRecord?.details
                ? dailyRecord.details.split('_')[1]?.split(',').map(i => Number(i)) || []
                : []; // ✅ `details` が存在しない場合は空配列を返す
            
            const sentences = todaysRecord.length || 0;
            const words = material
                .filter(item => todaysRecord.includes(Number(item.id))) // ID を数値型でチェック
                .reduce((sum, item) => sum + (Number(item.words) || 0), 0); 

            setAchievements(dev => ({ ...dev, word: words, sentence: sentences}));
        })
        .catch(() => {
            
        });
    }, [userInfo]); // ✅ 初回のみ実行

    //教材呼び出し
    useEffect(() => {
        if (isFetchedFlashcard.current) return; // ✅ すでに実行済みならスキップ
        isFetchedFlashcard.current = true; // ✅ 初回実行時にフラグを立てる
        
        const target = Math.floor(userInfo.target * App.multiier);

        Promise.all([
            fetch(`https://yuririn.github.io/englishmaterial/${userInfo.material}.json`).then(res => res.json()),
            fetch(`${App.getData}?userid=${userInfo.id}`).then(res => res.json())
        ])
            .then(([materialData, materialRecord]) => {
                if (!materialData || !materialRecord) {
                    console.log("データが取得できませんでした");
                    return;
                }

                const config = {
                    materialRecord,
                    userMaterial: userInfo.material,
                    materialData,
                    target,
                };

                setData(processQuizData(config));
                setLoading(false);

            })
            .catch(error => {
                console.error("エラー発生:", error);
            });
    }, []); // ✅ 初回のみ実行

    useEffect(() => {
        if (!loading) return; // ✅ ローディングが完了したらカウントダウン不要

        const interval = setInterval(() => {
            setCountdown((prevCountdown) => Math.max(prevCountdown - 1, 0));
        }, 1000);

        return () => clearInterval(interval); // ✅ クリーンアップ処理
    }, [loading]); // ✅ `loading` のみ依存

    const removeCard = (id) => {
        setData((prevData) => prevData.filter((item) => item.id !== id));
    };

    const limit = Math.floor(userInfo.target * App.multiier)

    return (
        <div className="Home">
            {loading ? (
                    <LoadingContent countdown={countdown} />
                ) : (
                    <>
                        <DailyAchievment achievements={achievements}></DailyAchievment>
                        {achievements.word >= limit &&
                        <p className="wrapper">You've learned more than 100 words. Let's call it for today!</p>}

                        {data.length > 0 ? (
                            <>
                                <div className="flashcards wrapper" style={{ display: achievements.word >= limit ? `none`: `grid`}}>
                                    {data.map((item, index) => (
                                        <FlashCard
                                            item={item}
                                            key={`${item.id}-${index}`}
                                            setAchievements={setAchievements}
                                            removeCard={removeCard}
                                            onSlugUpdate={handleSlugUpdate}
                                        />
                                    ))}
                                </div>
                                {selectedSlug && <Hint selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug} />}
                            </>
                        ) : (
                            <p>No data available. Please check your connection or try again later.</p>
                        )}
                    </>
                
            )}
        </div>
    );
};

export default Home;
