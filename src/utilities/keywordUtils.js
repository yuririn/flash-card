// be動詞かどうかを判定する関数
const isBeVerb = (word) => {
    const beForms = ["is", "are", "was", "were", "isn't", "aren't", "wasn't", "weren't", "be"];
    return beForms.includes(word.toLowerCase());
};

// 単語ごとの一致判定関数
const compareWords = (word1, word2) => {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();

    if (isBeVerb(word1) && isBeVerb(word2)) {
        return true; // 両方がbe動詞なら一致
    }

    // その他の単語は先頭部分を確認
    return word1.startsWith(word2.slice(0, 4)) || word2.startsWith(word1.slice(0, 4));
};

// キーワード配列を比較する関数
export const compareKeywordArrays = (keywordA, keywordB) => {
    const arrayA = keywordA.split(" ");
    const arrayB = keywordB.split(" ");

    if (arrayA.length !== arrayB.length) {
        return false; // 配列の長さが異なる場合は不一致
    }

    for (let i = 0; i < arrayA.length; i++) {
        if (!compareWords(arrayA[i], arrayB[i])) {
            return false; // 1つでも一致しない場合は不一致
        }
    }

    return true; // 全ての単語が一致
};
