
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) return null;

    // A simple parser to convert markdown-like syntax to JSX
    const renderContent = () => {
        return content.split('\n').map((line, index) => {
            // Bold **text**
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // List items * or -
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                 return <li key={index} dangerouslySetInnerHTML={{ __html: line.substring(2) }} className="ml-5 list-disc" />;
            }
            // Simple paragraph with line breaks
            return <p key={index} dangerouslySetInnerHTML={{ __html: line }} className="mb-2" />;
        });
    };

    return <div className="text-white/80 space-y-2 text-justify">{renderContent()}</div>;
};

export default MarkdownRenderer;
