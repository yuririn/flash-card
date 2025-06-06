import { useState } from 'react';
import styles from './../components/css/register.module.css';
const Welcome = ()=>{
    const [passCode, setPassCode] = useState(null);
    const passcodeHandler = (e)=>{
        const value = e.target.value;
        setPassCode(value);
    }
    const sendPasscode = async (e)=>{
        if(!passCode) {
            alert(`パスコードが入力されていません。`)
            return;
        }
    }

    return <div className="wrapper">
   
        <div className={styles.form}>
            <p>パスコードを入力してください。</p>
            <dl>
                <dt>PASS CODE</dt>
                <dd><input type="text" onInput={passcodeHandler}/></dd>
            </dl>
            
            <button className="btn-green" onClick={sendPasscode}>Send</button> 

        </div>
    </div>
}
export default Welcome
