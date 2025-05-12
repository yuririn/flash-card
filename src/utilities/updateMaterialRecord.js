import App from '../data/app.json'; // データ定義のインポート

export const updateMaterialRecord = (result, userInfo, id, level, skip, material, count) => {
    // materialRecord を取得（該当する materialId があれば使用）
    const materialRecord = result?.materialRecord?.find(i => i.materialId === userInfo.material) ?? {};
    const details = materialRecord?.details || ""; // details の初期化（空文字列で安全に処理）

    const now = new Date();
    const current = App.levels.find(item => item.name === level); // レベルのデータ取得

    if (!current) { // レベルが無効な場合エラーを出力し、処理終了
        console.error("Invalid level:", level);
        return null;
    }

    // 次の更新日を設定（スキップなら 1 日、そうでなければレベルの期間を追加）
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + (skip ? 1 : current.durition));
    const formattedDate = nextDate.toISOString().split("T")[0]; // YYYY-MM-DD 形式に変換

    // count の値が NaN の場合は 1 に設定（安全な変換）
    const countValue = isNaN(Number(count)) ? 1 : Number(count) + 1;

    // details を '|' で分割してレコード化（有効な値のみ取得）
    const records = details.split('|').filter(Boolean).map(entry => entry.split(','));
    let updatedRecords = [];
    let found = false;

    // データをループ処理し、既存データの更新
    records.forEach(record => {
        const [recordId, recordDate, recordLevel, recordCount] = record;

        if (recordId == id) { // ID が一致する場合、カウントを更新
            found = true;
            const newCount = isNaN(Number(recordCount)) ? 1 : Number(recordCount) + 1;
            updatedRecords.push([id, formattedDate, level, newCount]);
        } else {
            updatedRecords.push(record); // 変更なしのデータをそのまま追加
        }
    });

    if (!found) { // 新規データが存在しない場合は追加
        updatedRecords.push([id, formattedDate, level, 1]);
    }

    // 🔹 **ID順でソート（昇順）**
    updatedRecords.sort((a, b) => Number(a[0]) - Number(b[0]));

    // 🔹 **join('|') で元の形式に戻す**
    materialRecord.details = updatedRecords.map(record => record.join(',')).join('|');

    // 記録済みの単語・文の計算
    const triedMaterial = updatedRecords.map(record => Number(record[0]));

    // 🔹 words の合計を計算（triedMaterial に含まれる ID の words を集計）
    materialRecord.words = material
        .filter(item => triedMaterial.includes(item.id))
        .reduce((sum, item) => sum + (item.words ?? 0), 0);

    // 🔹 sentences は記録されたレコードの総数
    materialRecord.sentences = updatedRecords.length;

    // 初回のデータセット処理（materialId をセット）
    if (!materialRecord.materialId) {
        materialRecord.materialId = userInfo.material;
    }

    return materialRecord;
};
