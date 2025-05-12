import React, { useMemo } from 'react';
import Essay from "../data/essay.json";
import styles from './css/Quote.module.css';
import { marked } from "marked";

const EssayContent = ()=>{
    // useMemoを使用してランダムなQuoteを一度だけ選択し固定
    const pickedItem = useMemo(() => Essay[Math.floor(Math.random() * Essay.length)], []);

    const content = marked(pickedItem.content);

    return (
        <section className={styles.quote}>
            <h2>☕ 5-Second Essay related to English.</h2>
            <div>
                <h3 className={styles.essaybody_head}>{pickedItem.title}</h3>
                <div
                    
                className={styles.essaybody}
                    dangerouslySetInnerHTML={{ __html: marked(content) }}
                />
            </div>
        </section>
    );

}
export default EssayContent;


