// indexedDBUtils.js
// "settings"
// "dailyFlashCardScores"
// "instantComposition"
    export const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("EnglishFlashCardDB", 2);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const stores = {
                    "settings": { keyPath: "id" },
                    "dailyFlashCardScores": { keyPath: "uniqueKey" },
                    "instantSentencesScore": { keyPath: "id" },
                    "instantSentencesDailyScore": { keyPath: "date" },
                };

                Object.entries(stores).forEach(([store, options]) => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, options);
                    }
                });
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    };


export const addData = async (storeName, data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        console.error(`保存するデータがありません:`, data);
        return;
    }

    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    try {
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (storeName === "dailyFlashCardScores") {
                    item.uniqueKey = `${item.date}_${item.material}`; // ✅ `date` + `material` をキーにする
                }
                store.put(item);
            });
        } else {
            if (storeName === "dailyFlashCardScores") {
                data.uniqueKey = `${data.date}_${data.material}`; // ✅ 単体データにも適用
            }
            store.put(data);
        }

        transaction.oncomplete = () => {
            console.log(`データ保存成功:`, storeName, data);
        };

        transaction.onerror = (event) => {
            console.error(`データ保存エラー:`, event.target.error);
        };
    } catch (error) {
        console.error(`データ保存時の例外:`, error);
    }
};


export const getData = async (storeName, key = "latest") => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        if (key === "latest") {
            // 最新のデータを取得するためにカーソルを使用
            const request = store.openCursor(null, "prev"); // 降順で最新を取得
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                resolve(cursor ? cursor.value : null);
            };
            request.onerror = (event) => reject(event.target.error);
        } else {
            // 通常の `key` 指定による取得
            const request = store.get(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        }
    });
};

export const deleteData = async (storeName, id) => {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id); // 指定した `id` のデータを削除
};

export const getAllData = async (storeName, material = null) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.getAll(); // 🔹 すべてのデータを取得

        transaction.onerror = (event) => {
            console.error("トランザクションエラー:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const allData = event.target.result || [];

            let filteredData = allData;

            // 🔹 `material` を含むデータのみ取得
            if (material) {
                filteredData = filteredData.filter(item => item.uniqueKey.includes(`_${material}`));
            }

            // 🔹 `day` を基準に過去の日付をフィルタリング
            resolve(filteredData);
        };

        request.onerror = (event) => {
            console.error("データ取得エラー:", event.target.error);
            reject(event.target.error);
        };
    });
};


export const deleteKey = async (storeName, key) => {
    try {
        await deleteData(storeName, key);
        console.log(`削除成功: ${key}`);
    } catch (error) {
        console.error(`削除エラー:`, error);
    }
};
