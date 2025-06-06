import React, { useContext } from "react";
import { SettingsContext } from "../App";
import { calculateTargetValue } from "../utilities/commonUtils";
import Material from "../data/materials.json";

const DailyAchievment = ({ achievements })=>{
    console.log(achievements)
    const { settings, updateSettings } = useContext(SettingsContext);
    const target = settings.target;
    const currentMaterial = Material?.find(i => i.id === settings.material)
    const sentence = calculateTargetValue(target, currentMaterial?.rate)
    return (
        <dl className="achievements">
            <dt>{currentMaterial?.name}</dt>
            <dd>SENTENCES: <strong className={achievements.sentence >= sentence && `done`}>{achievements.sentence}</strong><small>/{sentence}</small></dd>
            <dd>WORDS: <strong className={achievements.word >= target && `done`}>{achievements.word}</strong><small>/{target}</small></dd>
        </dl>
    )
}
export default DailyAchievment;
