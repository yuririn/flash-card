import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import grammarData from "../data/pronunciation.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from '../components/css/Grammar.module.css'
import remarkSlug from "remark-slug";
import { SettingsContext } from "../App";
import MarkdownContent from './../components/MarkdownContent';

const Pronunciation = ()=>{
    const [content, setContent] = useState(""); 
    const { slug } = useParams();
    const [selectedVoice, setSelectedVoice] = useState(null);
    const { settings, updateSettings } = useContext(SettingsContext);
    const [highlightedKeyword, setHighlightedKeyword] = useState(null);
    
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

    useEffect(() => {
            if (!slug) {
                console.error("Invalid slug:", slug);
                setContent("# Error: No valid slug provided");
                return;
            }
            const fetchMarkdown = async () => {
                    try {
                    const filePath = require(`../content/pronunciation/${slug}.md`);
                    const response = await fetch(filePath);
                    const text = await response.text();
                    setContent(text);
                } catch (error) {
                    console.error("Markdown file not found:", error);
                    setContent("# Error loading content"); // エラーメッセージを表示
                }
            };
            
            fetchMarkdown();
        }, [slug]);

    
    const vowels = grammarData.filter(i=> i.genre === '母音')
    const consonant = grammarData.filter(i=> i.genre === '子音')
        
    if (!slug) {
        return <div className={`${styles.grammer} wrapper`}>
                    <header>
                        <h1>Pronunciation List</h1>
                        <h2>発音記号の読み方</h2>
                        <p>発音記号（IPA）が読めるようになると、音節やアクセント（ストレス）がわかるようになります。</p>
                        <h3>音節</h3>
                        <p>音節は 「一つの発音のまとまり」 であり、IPAでは . や ・ で区切られる。音節は比較級や最上級で変わってくるので、各単語が何音節あるのかも重要となる。</p>
                        <ul>
                            <li>computer → /kəm.ˈpjuː.tər/（3音節）</li>
                            <li>banana → /bə.ˈnæ.nə/（3音節）</li>
                            <li>cat → /kæt/（1音節）</li>
                        </ul>
                        <h3>アクセント（Stress）</h3>
                        <p>英語の単語には強勢（ストレス）があり、発音記号では ˈ（第一強勢）や ˌ（第二強勢） で示されます。</p>
                        <ul>
                            <li>information → /ˌɪn.fəˈmeɪ.ʃən/（強勢は "ma" の部分）</li>
                            <li>photography → /fəˈtɒ.grə.fi/（"tɒ" の部分が強く発音）</li>
                            <li>import → 動詞 /ɪmˈpɔːrt/（後ろに強勢） vs 名詞 /ˈɪm.pɔːrt/（前に強勢）</li>
                        </ul>
                        <p>特に、アクセントの位置によって意味が変わる単語（record, present, permit など）は、正しい発音を意識すると伝わりやすくなります！</p>
                        <h2>発音解説一覧</h2>
                        <h3>母音</h3>
                        <ul>
                        {vowels.map(i => <li><a href={`/pronunciation/${i.slug}`}>{i.jp}</a></li>)}

                        </ul>
                        <h3>子音</h3>
                        <ul>
                        {consonant.map(i => <li><a href={`/pronunciation/${i.slug}`}>{i.jp}</a></li>)}

                        </ul>
                        <h2>子音クラスター</h2>
                        <p>子音クラスターとは、複数の子音が連続する音の組み合わせ のことです。英語では、日本語にはない 2つ以上の子音 が連続することがあり、母音を挿入せずに滑らかに発音するのがポイントになります。</p>
                        <h3>母音を挿入せずに発音するコツ</h3>
                        <ul>
                            <li>子音同士の連続を意識する（母音を間に入れない）</li>
                            <li>口の形をスムーズに移動させる（日本語の音よりリズミカルに発音）</li>
                            <li>ゆっくり発音し、慣れてからスピードを上げる</li>
                        </ul>
                    </header>
                </div>
    }

    const pageData = grammarData.find(item => item.slug === slug);
    if (!pageData) {
        // 該当するデータがない場合は404ページを表示
        return <h1>404 - Page Not Found</h1>;
    }

    // MDファイルの内容を格納するState

    const handleKeywordClick = (clickedKeyword) => {
        // 音声を再生する処理
        const handlePlayAudio = (text, rate = 0.5) => {

            try {
                speechSynthesis.cancel(); // 現在の音声再生を停止
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = settings.lang; // 言語設定
                utterance.rate = rate; // 再生速度の設定
                utterance.voice = selectedVoice;
                speechSynthesis.speak(utterance); // 再生開始
            } catch (error) {
                console.error("Error while playing audio:", error);
            }
        };

        // キーワードを再生
        handlePlayAudio(clickedKeyword, .7);
    }

    return (
        <div className={`${styles.grammer} wrapper`}>
            <header>
                <h1>{pageData.name}</h1>
                <p>{pageData.jp}</p>
            </header>
            <MarkdownContent
                content={content || "データがありません"}
                remarkPlugins={[remarkGfm, remarkSlug]}
                onKeywordClick={handleKeywordClick}
                className=''
                highlightedKeyword={highlightedKeyword}
            ></MarkdownContent>
            <a href="/pronunciation/" className={styles.grammer__btn}>PRONUNCIATION</a>
        </div>
    );
}
export default Pronunciation;
