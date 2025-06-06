export const calculateTargetValue = (target, rate = 3.5) => {
    return Math.round((target ? target : 0) *  rate / 10) ;
};

// 🛠 ヘルパー関数群
export const fetchMaterialData = async (material) => {
    const res = await fetch(`https://yuririn.github.io/englishmaterial/${material}.json`);
    return res.json();
};

const now = new Date();
const offset = 8 * 60 * 60 * 1000; // UTC+8 の補正 (ミリ秒換算)
const philippinesISO = new Date(now.getTime() + offset).toISOString();
export const TODAY = philippinesISO.split("T")[0];

