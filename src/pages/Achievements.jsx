import React from "react";
import styles from "../components/css/Archievments.module.css";
import { useParams } from 'react-router-dom';
import TotalAchievement from "../components/TotalAchievement";
import DailyAchievement from "../components/DailyAchievement";
const Achievements = () => {
    const { slug } = useParams();


    if ( slug === 'composition' || slug === undefined) {
    return (
        <div className={`${styles.archievments} wrapper`}>
            <ul>
                <li><a href="/achievements/">フラッシュカード</a></li>
                <li><a href="/achievements/composition/">瞬間英作文</a></li>
            </ul>
            <TotalAchievement slug={slug}/>
            <DailyAchievement slug={slug}/>
        </div>
    );
    } else {
        return <h1>404 - Page Not Found</h1>;
    }
};

export default Achievements;
