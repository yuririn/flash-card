import React, { useState, useRef, useContext } from "react";
import styles from './css/Flashcard.module.css';
import ReadOut from './ReadOut';
import { marked } from "marked";
import { compareKeywordArrays } from '../utilities/keywordUtils'; // ユーティリティをインポート
import { processKeywordData } from '../utilities/processKeywordData'; // ユーティリティをインポート
import MarkdownContent from './MarkdownContent';
import grammarData from "../data/grammer.json";
import UpdateCard from "./UpdateCard";
import { SettingsContext } from "../App";

const FlashCard = (props) => {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [isHidden, setIsHidden] = useState(false);
    const { item, onSlugUpdate, onDelete, setAchievements } = props;
    const safeItem = item && typeof item === "object" ? item : { question: "データがありません" };
    const { id, question, keyword, japanese, genre, level = null, count = 0, words, tips } = safeItem;
    const nodeRef = useRef(null);
    const [currentButton, setCurrentButton] = useState(null);
    const [displayContent, setDisplayContent] = useState(null);
    const [highlightedKeyword, setHighlightedKeyword] = useState(null);

    const voices = speechSynthesis.getVoices();
    console.log(voices.length)

    const hints = processKeywordData(keyword);
    const handleKeywordClick = (clickedKeyword) => {

        // 音声を再生する処理
        const handlePlayAudio = (text, rate = 0.5) => {

            try {
                speechSynthesis.cancel(); // 現在の音声再生を停止
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = settings.lang; // 言語設定
                utterance.rate = rate; // 再生速度の設定
                const voicesForLang = voices.filter(v => v.lang === settings.lang);
                utterance.voice = voicesForLang.length > 0 ? voicesForLang[voicesForLang.length - 1] : voices[voices.length - 1];
                
                speechSynthesis.speak(utterance); // 再生開始
            } catch (error) {
                console.error("Error while playing audio:", error); 
            }
        };

        // キーワードを再生
        handlePlayAudio(clickedKeyword, .5);

        if (highlightedKeyword === clickedKeyword) {
            setDisplayContent(null);
            setHighlightedKeyword(null);
            return;
        }

        const matchingHint = hints.find(hint =>
            compareKeywordArrays(hint.keyword, clickedKeyword)
        );

        if (matchingHint) {
            setDisplayContent(matchingHint.content);
        } else {
            setDisplayContent(`No content available for **${clickedKeyword}**`);
        }

        setHighlightedKeyword(clickedKeyword);
    };

    const handleJPButtonClick = () => {
        if (currentButton === "JP") {
            setDisplayContent(null);
            setCurrentButton(null);
        } else {
            setDisplayContent(
                `${japanese}   
                ${tips}`);
            setCurrentButton("JP");
        }
    };

    
    return (
        <section className={`${styles.flashcard}${isHidden ? " hide" : ''}`}>
            <div ref={nodeRef}>
                <div className={styles.main} data-label={id}>
                    <MarkdownContent
                        content={question || "データがありません"}
                        onKeywordClick={handleKeywordClick}
                        highlightedKeyword={highlightedKeyword}
                    />
                    <ul className={styles.flashcardController}>
                        <ReadOut question={question} />
                        <li>
                            <button
                                className={currentButton === "JP" ? "jp-button current" : "jp-button"}
                                onClick={handleJPButtonClick}
                            >
                                <i>🇯🇵</i> JP
                            </button>
                        </li>
                    </ul>
                    {displayContent && (
                        <div
                            className={styles.displayContent}
                            dangerouslySetInnerHTML={{ __html: marked(displayContent) }}
                        />
                    )}
                    <dl className={styles.genreList}>
                        <dt>💡HINT</dt>
                        <dd>
                            {genre.map((item, key) => {
                                const currentItem = grammarData.filter(i => i.name === item)[0]
                                return <button
                                    key={key}
                                    onClick={() => {
                                        if (currentItem) {
                                            onSlugUpdate(currentItem.slug);
                                        }
                                    }}
                                >
                                    {currentItem?.jp}
                                </button>
                            })}
                        </dd>
                    </dl>
                </div>
            </div>
            <UpdateCard
                level={level}
                count={count || 0}
                wordsTotal={words}
                onDelete={onDelete}
                words={words}
                id={id}
                setIsHidden={setIsHidden}
                setAchievements={setAchievements}
            />
        </section>
    );
};

export default FlashCard;
