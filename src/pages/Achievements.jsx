import React, { useState, useEffect, useRef } from "react";
import styles from "../components/css/Archievments.module.css";
import LoadingContent from "../components/LoadingContent";
import App from '../data/app.json'
import { createPieChart } from "../utilities/chartUtils";

const Achievements = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [data, setData] = useState([]);
    const [param, setParam] = useState(3);
    const [totalData, setTotalData] = useState({});
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const levels = App.levels

    useEffect(() => {
        Promise.all([
            fetch(`${App.getData}?userid=${userInfo.id}&days=1`).then(res => res.json())
        ])
            .then(([result]) => {
                if (result?.materialRecord) {
                    setLoading(false);

                    const item = result?.materialRecord.filter(i => i.materialId === userInfo.material)[0] || {};
                    setTotalData({ sentences: item.sentences ?? 0, words: item.words ?? 0 });

                    const details = item.details?.split('|').map(i => i.split(',')[2]) || [];

                    const summary = details.reduce((acc, key) => {
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {});

                    const sortedSummary = Object.entries(summary)
                        .sort((a, b) => b[1] - a[1])
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

                    if (chartRef.current) {
                        createPieChart(chartRef, chartInstanceRef, sortedSummary);
                    }
                }
            })
            .catch(error => console.error("データ取得エラー:", error));
    }, [setTotalData]);


    useEffect(() => {
        Promise.all([
            fetch(`${App.getData}?userid=${userInfo.id}&days=${param}`).then(res => res.json()),
            fetch(`https://yuririn.github.io/englishmaterial/${userInfo.material}.json`).then(res => res.json())
        ])
        .then(([result, material]) => {
            if(!result || !material) return;
            const dailyRecord = result?.dailyRecord?.filter(i => i.material === userInfo.material).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
            const mergeData = dailyRecord.map(i => {
                const details = i.details.split('_')[1].split(',').map(i => Number(i))
                const wordsTotal = material
                    .filter(item => details.includes(item.id)) // ✅ IDが `details` に含まれるものを抽出
                    .reduce((sum, item) => sum + (item.words ?? 0), 0);
                const totalLevel = i.level.reduce((sum, value) => sum + value, 0);
                return { date: i.date, words: wordsTotal, level: i.level, centence: totalLevel }
            })
            setData(mergeData)
        })
        .catch(error => console.error("データ取得エラー:", error));
    }, [param]);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setCountdown(prevCountdown => (prevCountdown > 0 ? prevCountdown - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [loading]);

    return (
        <div className={`${styles.archievments} wrapper`}>
            {loading ? (
                <LoadingContent countdown={countdown} />
            ) : (
                <>
                    <dl className={styles.archievments_total}>
                            <dt>🏆️<br />TOTAL ACHIEVEMENTS of {userInfo.material}</dt>
                        <dd>SENTENCES <span>{totalData.sentences || 0}</span></dd>
                        <dd>
                                COMPREHENSION
                                <div>
                                    <canvas ref={chartRef} width="100"
                                        hight="100"></canvas>
                                </div>
                        </dd>
                            <dd>WORDS<span>{totalData.words || 0}</span></dd>
                    </dl>
                    <ul className={styles.archievments_controlls}>
                        {[
                            { label: "3 DAYS", value: 3 },
                            { label: "7 DAYS", value: 7 },
                            { label: "2 WEEKS", value: 14 },
                            { label: "1 MONTH", value: 30 },
                        ].map((button) => (
                            <li key={button.value}>
                                <button
                                    onClick={() => setParam(button.value)}
                                    className={param === button.value ? styles.active : ""}

                                >
                                    {button.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <table>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>SENTENCES</th>
                                <th>WORDS</th>
                            </tr>
                        </thead>
                        <tbody>
                                {data.length>0&&
                                (
                                    data.map(item =>{
                                        const maxDetail = Math.max(...item.level);
                                        return (<tr key={item.date}>
                                            <th>{item.date}</th>
                                            <td className={styles.archievments_centences}>
                                                <span>Total: {item.centence}</span>
                                                <dl>
                                                {item.level.map((level, index) => {
                                                    const percentage = ((level / maxDetail) * 100).toFixed(3);

                                                    return (
                                                        <><dt>{App.levels[index]?.name}: {level}</dt><dd key={index} style={{ width: `${percentage}%` }} className={`bg-${levels[index]?.color}`} // 安全参照
                                                         data-tooltip={levels[index]?.name} > </dd></>
                                                    )
                                                })}
                                                </dl>
                                            </td>
                                            <td className={styles.archievments_idioms}> <span>Total: {item.words}</span>
                                                {(item.words / 75 * 100).toFixed(2)} % {item.words < 75 ? (
                                                    <ul className={styles.unsuccess}>
                                                        <li style={{ width: `${item.words / 75 * 100}%` }}></li>
                                                    </ul>
                                                ) : (
                                                    <ul className={styles.success}>
                                                        <li style={{ width: `${75 / item.words * 100}%` }}>
                                                        </li>
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>)
                                    })
                                )
                            }
                        </tbody>
                    </table>

                    {/* 

                    <table>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>SENTENCES</th>
                                <th>WORDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, key) => {
                                    const maxDetail = Math.max(...item.details);
                                    const total = item.details.reduce((sum, num) => sum + num, 0);

                                    return (
                                        <tr key={key}>
                                            <th>{item.date}</th>
                                            <td className={styles.archievments_centences}>
                                                <span>Total: {total}</span>
                                                <dl> {item.details.map((detail, index) => {
                                                    // 最大値を基準に100分率を計算
                                                    const percentage = ((detail / maxDetail) * 100).toFixed(3);
                                                    return (
                                                         <> <dt>{levels[index]?.name}: {detail}</dt> <dd key={index} style={{ width: `${percentage}%` }} className={`bg-${levels[index]?.color}`} // 安全参照
                                                         data-tooltip={levels[index]?.name} > </dd> 
                                                         </> 
                                                         ); 
                                                         }
                                                    )} 
                                                </dl>
                                            </td>
                                            <td className={styles.archievments_idioms}> <span>Total: {item.wordsTotal}</span>
                                            {(item.wordsTotal / 75 * 100).toFixed(2)} % {item.wordsTotal < 75 ? (
                                                <ul className={styles.unsuccess}>
                                                    <li style={{ width: `${item.wordsTotal / 75 * 100}%` }}></li>
                                                </ul>
                                            ) : (
                                                <ul className={styles.success}>
                                                    <li style={{ width: `${75 / item.wordsTotal * 100}%` }}>
                                                    </li>
                                                </ul>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="3">No data available.</td></tr>
                            )}
                        </tbody>
                    </table> */}
                </>
            )}
        </div>
    );
};

export default Achievements;
