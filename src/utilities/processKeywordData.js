// processKeywordData.js
export const processKeywordData = (data) => {
    const lines = data.split("\n").map(line => line.trim()).filter(line => line);

    const result = [];
    let currentKey = null;
    let currentContent = [];

    lines.forEach(line => {
        const keywordMatch = line.match(/\*\*(.*?)\*\*/);
        if (keywordMatch) {
            if (currentKey) {
                // 前のキーワードと内容を結果に追加
                result.push({
                    keyword: currentKey,
                    content: currentContent.join("\n") // 改行を保持
                });
            }
            // 新しいキーワードの処理を開始
            currentKey = keywordMatch[1]; // キーワード部分のみ抽出
            currentContent = [line]; // 本文を初期化
        } else if (currentKey) {
            // 本文を追加
            currentContent.push(line);
        }
    });

    if (currentKey) {
        result.push({
            keyword: currentKey,
            content: currentContent.join("\n")
        });
    }

    return result;
};
