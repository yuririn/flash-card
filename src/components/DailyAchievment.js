const DailyAchievment = ({ achievements })=>{
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const target = parseInt(userInfo.target)
    const centence = Math.round((target ? target : 0) * 0.35 / 10) * 10 
    return (
        <dl className="achievements">
            <dt>{achievements.material}</dt>
            <dd>SENTENCES: <strong className={achievements.sentence >= centence && `done`}>{achievements.sentence}</strong><small>/{centence}</small></dd>
            <dd>WORDS: <strong className={achievements.word >= target && `done`}>{achievements.word}</strong><small>/{target}</small></dd>
        </dl>
    )
}
export default DailyAchievment;
