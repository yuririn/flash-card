import React from "react";
import { marked } from "marked";


const MarkdownContent = ({ content, onKeywordClick }) => {
    const renderHtmlContent = (content) => {
        const tokens = marked.lexer(content); // マークダウン解析
        return tokens.map((token, index) => {
            if (token.type === "paragraph") {
                return (
                    <p key={index}>
                        {token.tokens.map((t, i) => {
                            if (t.type === "strong") {
                                // strongタグをクリック可能に
                                return (
                                    <strong
                                        key={i}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onKeywordClick(t.text)}
                                    >
                                        {t.text}
                                    </strong>
                                );
                            }
                            return t.text;
                        })}
                    </p>
                );
            }
            return null;
        });
    };

    return <div className="main">{renderHtmlContent(content)}</div>;
};

export default MarkdownContent;
