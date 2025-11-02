import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) return null;

    const renderContent = () => {
        const lines = content.split('\n');
        const elements = [];
        let listItems: string[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 mb-2">
                        {listItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            let processedLine = line
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-gray-100">$1</strong>')
                .replace(/\_(.*?)\_/g, '<em>$1</em>')
                .replace(/\(Sanskrit: (.*?)\)/g, '(<span class="font-serif text-gray-600 dark:text-gray-400">$1</span>)');

            if (processedLine.trim().startsWith('### ')) {
                flushList();
                elements.push(<h3 key={index} dangerouslySetInnerHTML={{ __html: processedLine.substring(4) }} className="text-xl font-bold gradient-text mt-6 mb-3" style={{fontFamily: 'Playfair Display, serif'}}/>);
                return;
            }
            if (processedLine.trim().startsWith('## ')) {
                flushList();
                elements.push(<h2 key={index} dangerouslySetInnerHTML={{ __html: processedLine.substring(3) }} className="text-2xl font-bold gradient-text mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2" style={{fontFamily: 'Playfair Display, serif'}} />);
                return;
            }
            if (processedLine.trim().startsWith('* ') || processedLine.trim().startsWith('- ')) {
                listItems.push(processedLine.substring(2).trim());
                return;
            }
            
            flushList();
            if (processedLine.trim()) {
                elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} className="mb-2 leading-relaxed" />);
            }
        });
        
        flushList();

        return elements;
    };

    return <div className="text-gray-700 dark:text-gray-300 space-y-2">{renderContent()}</div>;
};

export default MarkdownRenderer;
