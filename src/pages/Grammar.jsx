import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import grammarData from "../data/grammer.json";
import ReactMarkdown from "react-markdown";
import styles from '../components/css/Grammar.module.css'
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";

function Grammar() {
    const [content, setContent] = useState(""); 
    const { slug } = useParams();
    
    useEffect(() => {
        if (!slug) {
            console.error("Invalid slug:", slug);
            setContent("# Error: No valid slug provided");
            return;
        }
        const fetchMarkdown = async () => {
            try {
                const filePath = require(`../content/grammar/${slug}.md`);
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

    if (!slug) {
        // Display list of grammar items
        return (
            <div className={`${styles.grammer} wrapper`}>
                <header>
                    <h1>Grammar List</h1>
                    <p>文法解説一覧</p>
                </header>
                <ul>
                    <li><a href="#basic">基礎文法</a></li>
                    <li><a href="#middle">基本文法</a></li>
                    <li><a href="#high">難解な文法</a></li>
                    <li><a href="#expressions">レベルに関係なく学べる</a></li>
                </ul>
                <h2 id='basic'>基礎文法</h2>
                <ul className={`${styles.grammarList} yellow-list`}>
                    {grammarData.filter(i=>i.level === 'basic').map((item) => (
                        <li key={item.slug}>
                            <a href={`/grammar/${item.slug}`}>
                                <h3>{item.jp}<small>{item.name}</small></h3>
                                
                                <p>{item.explain}</p>
                            </a>
                        </li>
                    ))}
                </ul>
                <h2 id='middle'>基本文法</h2>
                <ul className={`${styles.grammarList} green-list`}>
                    {grammarData.filter(i => i.level === 'middle').map((item) => (
                        <li key={item.slug}>
                        {
                            item.explain ? (
                            <a href={`/grammar/${item.slug}`}>
                                <h3>{item.jp}<small>{item.name}</small></h3>

                                <p>{item.explain}</p>
                            </a>

                            ):(

                            <span>
                                <h3>{item.jp}<small>{item.name}</small></h3>

                                <p>{item.explain}</p>
                            </span>
                            )
                        }
                        </li>
                    
                    ))}
                </ul>
                <h2 id='hight'>難解な文法</h2>
                <ul className={styles.grammarList}>
                    {grammarData.filter(i=>i.level === 'high').map((item) => (
                        <li key={item.slug}>
                            {
                                item.explain ? (
                                    <a href={`/grammar/${item.slug}`}>
                                        <h3>{item.jp}<small>{item.name}</small></h3>

                                        <p>{item.explain}</p>
                                    </a>

                                ) : (

                                    <span>
                                        <h3>{item.jp}<small>{item.name}</small></h3>

                                        <p>{item.explain}</p>
                                    </span>
                                )
                            }
                        </li>
                    ))}
                </ul>
                <h2 id='expressions'>レベルに関係なく学べる</h2>
                <ul className={`${styles.grammarList} pink-list`}>
                    {grammarData.filter(i=>i.level === 'expressions').map((item) => (
                        <li key={item.slug}>
                            {
                                item.explain ? (
                                    <a href={`/grammar/${item.slug}`}>
                                        <h3>{item.jp}<small>{item.name}</small></h3>

                                        <p>{item.explain}</p>
                                    </a>

                                ) : (

                                    <span>
                                        <h3>{item.jp}<small>{item.name}</small></h3>

                                        <p>{item.explain}</p>
                                    </span>
                                )
                            }
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    const pageData = grammarData.find(item => item.slug === slug);
    if (!pageData) {
        // 該当するデータがない場合は404ページを表示
        return <h1>404 - Page Not Found</h1>;
    }

    // MDファイルの内容を格納するState

    return (
        <div className={`${styles.grammer} wrapper`}>
            <header>
                <h1>{pageData.name}</h1>
                <p>{pageData.jp}</p>
            </header>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkSlug]}>{content}</ReactMarkdown>
            <a href="/grammar/" className={styles.grammer__btn}>GRAMMAR</a>
        </div>
    );
}
export default Grammar;
