import React, { useState, useRef } from "react";
import { marked } from "marked";
import MarkdownContent from './MarkdownContent';
import { compareKeywordArrays } from '../utilities/keywordUtils'; // ユーティリティをインポート
import { processKeywordData } from '../utilities/processKeywordData'; // ユーティリティをインポート
import UpdateCard from "./UpdateCard";
import ReadOut from './ReadOut';
import styles from './css/Flashcard.module.css';
import grammarData from "../data/grammer.json";

const FlashCard = ({ item, onSlugUpdate, setAchievements, removeCard }) => {
    const nodeRef = useRef(null);

    const [isHidden, setIsHidden] = useState(false); 

    // item が undefined や null だった場合にデフォルト値を適用
    const safeItem = item && typeof item === "object" ? item : { question: "データがありません" };

    const { id, question, keyword, japanese, genre, level = null, count = 0, words, tips } = safeItem;
    
    const [highlightedKeyword, setHighlightedKeyword] = useState(null);
    const [displayContent, setDisplayContent] = useState(null);
    const [currentButton, setCurrentButton] = useState(null);
    const hints = processKeywordData(keyword);

    const handleKeywordClick = (clickedKeyword) => {

        // 音声を再生する処理
        const handlePlayAudio = (text, rate = 0.5) => {

            try {
                speechSynthesis.cancel(); // 現在の音声再生を停止
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US'; // 言語設定
                utterance.rate = rate; // 再生速度の設定
                speechSynthesis.speak(utterance); // 再生開始
            } catch (error) {
                console.error("Error while playing audio:", error); // エラー時のログ
            }
        };

        // キーワードを再生
        handlePlayAudio(clickedKeyword, 0.5);

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

    // ✅ 親コンポーネントから受け取ったデータを使ってカードを非表示にする
    const onUpdate = (updateId) => {
        if (updateId === id) {
            setIsHidden(true); // ✅ ID が一致した場合、非表示状態にする
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
                <UpdateCard
                    currentLevel={level}
                    count={count}
                    wordsTotal={words}
                    id={id}
                    setAchievements={setAchievements}
                    onUpdate={onUpdate}
                    removeCard={removeCard}
                />
            </div>
        </section>
    );
};

export default FlashCard;
