import React, { useState, useEffect } from 'react';
import grammarData from "../data/grammer.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from '../components/css/Grammar.module.css'

const Hint = ({ selectedSlug, setSelectedSlug }) => {
    const [content, setContent] = useState(""); 
    useEffect(() => {
            const fetchMarkdown = async () => {
                try {
                    const filePath = require(`../content/${selectedSlug}.md`);
                    const response = await fetch(filePath);
                    const text = await response.text();
                    setContent(text);
                } catch (error) {
                    console.error("Markdown file not found:", error);
                    setContent("# Error loading content"); // エラーメッセージを表示
                }
            };
            
            fetchMarkdown();
    }, [selectedSlug]);
    const pageData = grammarData.find(item => item.slug === selectedSlug);
    
    return (
        <>
            <div onClick={() => { setSelectedSlug(null) }} className="pupup__bg"></div>
            <div className="pupup__main">
                <section className={styles.grammer}>
                    <header>
                        <h1>{pageData.name}</h1>
                        <p>{pageData.jp}</p>
                    </header>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    <p className="pupup__main__close">

                        <button onClick={() => { setSelectedSlug(null) }}>CLOSE</button>
                    </p>
                </section>
            </div>
        </>
    );
};

export default Hint;
