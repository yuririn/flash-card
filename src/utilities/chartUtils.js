import { Chart, registerables } from 'chart.js';
import App from '../data/app.json';

// 🔹 **Chart.js のモジュールを登録**
Chart.register(...registerables);

export const createPieChart = (chartRef, chartInstanceRef, sortedSummary) => {
    // 🔹 **ラベル & データの取得**
    const labels = Object.keys(sortedSummary);
    const dataValues = Object.values(sortedSummary);

    // 🔹 **背景色の取得**
    const backgroundColors = labels.map(label => {
        const level = App.levels.find(l => l.name === label);
        return level ? getComputedStyle(document.documentElement).getPropertyValue(`--${level.color}`) : 'gray';
    });

    // 🔹 **既存のチャートインスタンスを破棄**
    if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
    }

    console.log("Chart ref:", chartRef.current);

    // 🔹 **新規チャートインスタンスを作成**
    chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    return chartInstanceRef.current;
};
