import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// HMRの設定
if (module.hot) {
    module.hot.accept("./App", () => {
        console.log("App.js の更新を受け入れました");
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    });
}

reportWebVitals();
