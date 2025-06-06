import React, { useState, useContext } from 'react';
import { SettingsContext } from "../App";

const ReadOut = ({ question }) => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const sanitizedQuestion = question.replace(/\*/g, "");
    const [isPlaying, setIsPlaying] = useState(false); // 再生状態を管理
    const [currentRate, setCurrentRate] = useState(null); // 現在の再生速度

    const handlePlayAudio = (rate) => {
        // 同じボタンが押された場合に停止
        if (isPlaying && currentRate === rate) {
            speechSynthesis.cancel(); // 再生を停止
            setIsPlaying(false);
            setCurrentRate(null);
            return;
        }

        // 再生中の音声を停止して新しい音声を再生
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sanitizedQuestion);
        utterance.lang = settings.lang; // 言語設定
        utterance.rate = rate; // 話す速度を設定
        speechSynthesis.speak(utterance); // 音声を再生
        setIsPlaying(true); // 再生状態を更新
        setCurrentRate(rate); // 現在の再生速度を更新
    };

    return (
        <>
            <li>
                <button onClick={() => handlePlayAudio(1)} className={isPlaying && currentRate === 1 ? `stop-button` : `play-button` }>1
                    </button>
            </li>
            <li>
                <button onClick={() => handlePlayAudio(0.5)} className={isPlaying && currentRate === 0.5 ? `stop-button` : `play-button`}>0.5</button>
            </li>
            <li>
                <button onClick={() => handlePlayAudio(0.05)} className={isPlaying && currentRate === 0.05 ? `stop-button` : `play-button`}>0.05</button>
            </li>
        </>
    );
};

export default ReadOut;
