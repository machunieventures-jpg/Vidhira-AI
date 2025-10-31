
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) return null;

    // A simple parser to convert markdown-like syntax to JSX
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
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-starlight/90">$1</strong>')
                .replace(/\_(.*?)\_/g, '<em class="italic">$1</em>')
                // New regex to handle and style Sanskrit terms
                .replace(/\(Sanskrit: (.*?)\)/g, '(<span class="sanskrit" style="font-family: \'Hind\', sans-serif; font-weight: 500; color: #F0F6FC;">$1</span>)');

            if (processedLine.trim().startsWith('### ')) {
                flushList();
                elements.push(<h3 key={index} dangerouslySetInnerHTML={{ __html: processedLine.substring(4) }} className="text-xl font-semibold text-cosmic-gold font-display mt-6 mb-3" />);
                return;
            }
            if (processedLine.trim().startsWith('## ')) {
                flushList();
                elements.push(<h2 key={index} dangerouslySetInnerHTML={{ __html: processedLine.substring(3) }} className="text-2xl font-bold text-starlight font-display mt-8 mb-4 border-b border-lunar-grey/20 pb-2" />);
                return;
            }
            if (processedLine.trim().startsWith('* ') || processedLine.trim().startsWith('- ')) {
                listItems.push(processedLine.substring(2).trim());
                return;
            }
            
            flushList();
            if (processedLine.trim()) {
                elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} className="mb-2" />);
            } else if (elements.length > 0 && elements[elements.length - 1].type === 'p') {
                // To create some space between paragraphs
                elements.push(<div key={`space-${index}`} className="h-2"></div>);
            }
        });
        
        flushList(); // Flush any remaining list items

        return elements;
    };

    return <div className="text-lunar-grey space-y-2 text-justify">{renderContent()}</div>;
};

export default MarkdownRenderer;
