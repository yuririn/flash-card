import React, { useMemo } from 'react';
import QuoteContent from "./QuoteContent";
import EssayContent from "./EssayContent";

const LoadingContent = ({countdown}) => {
    // useMemoを使用してランダムに選択
    const RandomContent = useMemo(() => {
        const components = [QuoteContent, EssayContent];
        // ランダムに1つのコンポーネントを選択
        return components[Math.floor(Math.random() * components.length)];
    }, []); // 初回レンダリング時のみ再計算

    return (
        <>
            <p className='loading'>
                {countdown}
                <strong>⏳</strong>
            </p>
            <RandomContent />
        </>
    );
};

export default LoadingContent;


