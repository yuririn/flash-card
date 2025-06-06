import React from "react";
import styles from "../components/css/Archievments.module.css";
import { useParams } from 'react-router-dom';
import TotalAchievement from "../components/TotalAchievement";
import DailyAchievement from "../components/DailyAchievement";
import { Link, useLocation } from "react-router-dom";
const Achievements = () => {
    const { slug } = useParams();
    const location = useLocation();


    if (slug === 'composition' || slug === undefined) {
        return (
            <div className={`${styles.archievments} wrapper`}>
                <ul className='archievments_nav'>
                    <li><Link to="/achievements/" className={location.pathname === '/achievements/' && `active`}>フラッシュカード</Link></li>
                    <li><Link to="/achievements/composition/" className={location.pathname !== '/achievements/' && `active`}>瞬間英作文</Link></li>
                </ul>
                <TotalAchievement slug={slug} />
                <DailyAchievement slug={slug} />
            </div>
        );
    } else {
        return <h1>404 - Page Not Found</h1>;
    }
};

export default Achievements;
