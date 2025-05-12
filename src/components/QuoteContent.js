import React, { useMemo } from 'react';
import Quotes from "../data/quotes.json";
import styles from './css/Quote.module.css';

const QuoteContent = () => {
    // useMemoを使用してランダムなQuoteを一度だけ選択し固定
    const pickedItem = useMemo(() => Quotes[Math.floor(Math.random() * Quotes.length)], []);

    return (
        <section className={styles.quote}>
            <h2>☕ 5-Second History Nuggets.</h2>
            <blockquote>
                <div className={styles.main}>
                    <p>{pickedItem.quote.en}</p>
                    <p>{pickedItem.quote.jp}</p>
                </div>
                <div className={styles.footer}>
                    <p>{pickedItem.name.en}<small>{pickedItem.name.jp}</small></p>
                    <p>{pickedItem.profession.en}<small>{pickedItem.profession.jp}</small></p>
                    <p>{pickedItem.lifetime}</p>
                </div>
            </blockquote>
        </section>
    );
}

export default QuoteContent;
