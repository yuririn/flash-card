import React from "react";
import { marked } from "marked";

const MarkdownContent = ({ content, onKeywordClick, className = "main" }) => {
    const renderHtmlContent = (content) => {
        const tokens = marked.lexer(content); // マークダウン解析
        const elements = [];

        tokens.forEach((token, index) => {
            let Tag = null;

            if (token.type === "heading") {
                Tag = `h${token.depth}`;
            } else if (token.type === "blockquote") {
                Tag = "blockquote";
            } else if (token.type === "paragraph") {
                Tag = "p";
            } else if (token.type === "list") {
                // `ul` or `ol` を生成
                Tag = token.ordered ? "ol" : "ul";
                elements.push(
                    <Tag key={index}>
                        {token.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                                {item.tokens?.map((t, i) => {
                                    if (t.type === "strong") {
                                        return (
                                            <strong
                                                key={i}
                                                style={{ cursor: "pointer;" }}
                                                onClick={() => onKeywordClick(t.text)}
                                            >
                                                {t.text}
                                            </strong>
                                        );
                                    }
                                    return <span key={i}>{t.text || ""}</span>;
                                })}
                            </li>
                        ))}
                    </Tag>
                );
                return;
            }

            if (Tag) {
                elements.push(
                    <Tag key={index}>
                        {token.tokens?.map((t, i) => {
                            if (t.type === "strong") {
                                return (
                                    <strong
                                        key={i}
                                        style={{ cursor: "pointer;" }}
                                        onClick={() => onKeywordClick(t.text)}
                                    >
                                        {t.text}
                                    </strong>
                                );
                            }
                            return <span key={i}>{t.text || ""}</span>;
                        })}
                    </Tag>
                );
            }
        });

        return elements;
    };

    return <div className={className}>{renderHtmlContent(content)}</div>;
};

export default MarkdownContent;
