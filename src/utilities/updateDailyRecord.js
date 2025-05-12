import App from '../data/app.json';
export const updateDailyRecord = (result, userInfo, id, level) => {
    const dailyRecord = result?.dailyRecord?.find(i => i.material === userInfo.material) || null;
    const setLevel = dailyRecord?.level || [0, 0, 0, 0, 0];
    const levelIndex = App.levels.findIndex(l => l.name === level);

    if (levelIndex !== -1) {
        setLevel[levelIndex] += 1;
    }

    if (dailyRecord !== null) {
        dailyRecord.details += ',' + id;
        dailyRecord.level = setLevel;
    } else {
        return {
            date: new Date().toISOString().split("T")[0],
            material: userInfo.material,
            level: setLevel,
            details: '_' + id
        };
    }

    return dailyRecord; // ✅ 加工後のデータを返す
};

