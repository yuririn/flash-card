export const processQuizData = (config) => {
    const { materialRecord, userMaterial, materialData, target } = config;

    // ✅ ユーザーの教材情報を取得
    const quizDetails = materialRecord.find(item => item.materialId === userMaterial)?.details || "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredAllQuiz = quizDetails.split('|')
        .map(item => {
            const [id, date, level, count] = item?.split(',') || [];
            return id && date && level && count ? { id, date, level, count: Number(count) } : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const filteredQuiz = filteredAllQuiz
        .filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0); // 各アイテムの日付も時間を削除
            return itemDate <= today;
        })

    // ✅ 教材データを整理
    const materialMap = new Map(materialData.flat().map(obj => [String(obj.id), obj]));

    // ✅ 過去に試した問題の `id` をセット化
    const triedQuizIds = new Set(filteredQuiz.map(quiz => quiz.id));

    // ✅ `words` の総数が `target * 0.7` に近づくよう、試した問題を選択
    let selectedQuiz = [];
    let selectedWords = 0;

    for (const quiz of filteredQuiz) {
        const material = materialMap.get(quiz.id);
        if (material && selectedWords + material.words <= target) {
            selectedQuiz.push({
                ...quiz,
                ...material,
                count: quiz.count || 0 // ✅ `count` が `undefined` の場合、デフォルト値を設定
            });
            selectedWords += material.words;
        }
    }

    // ✅ 試したことがある問題を `attemptedQuiz` に格納（`count` を確実に保持）
    const attemptedQuiz = selectedQuiz.map(quiz => ({
        ...quiz,
        level: quiz.level,
        count: quiz.count // ✅ `count` を確実に統合
    }));

    // ✅ 未使用の問題を `remainingQuiz` に追加し、`words` の合計が `target` に近づくまで選択
    let remainingQuiz = [];
    let remainingWords = selectedWords;

    const triedAllQuizIds = new Set(filteredAllQuiz.map(quiz => quiz.id));
    

    for (const material of materialMap.values()) {
        // ✅ `triedQuizIds` の `id` を文字列に変換して比較
        
        if (!triedAllQuizIds.has(String(material.id)) && remainingWords + material.words <= target) {
            remainingQuiz.push(material);
            remainingWords += material.words;
        }
    }

    return [...attemptedQuiz, ...remainingQuiz];
};

// ✅ 配列をシャッフルする関数
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
