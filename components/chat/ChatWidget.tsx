import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, UserData, WorldClassReport } from '../../types';
import { getChatResponse } from '../../services/geminiService';
import ChatMessageBubble from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { trackEvent } from '../../services/analyticsService';

const MessageCircle = ({ size = 28, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const Send = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;


interface ChatWidgetProps {
    report: WorldClassReport;
    userData: UserData;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ report, userData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `Hello ${userData.fullName.split(' ')[0]}! I am Vidhira, your personal AI numerology companion. How can I help you explore your destiny today?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: trimmedInput };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        trackEvent('CHAT_MESSAGE_SENT', { messageLength: trimmedInput.length });

        try {
            const aiResponse = await getChatResponse(newMessages, trimmedInput, report, userData);
            setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'ai', text: "I'm having trouble connecting to the cosmic energies right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[--cosmic-purple] to-[--gold-accent] text-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50 no-print"
                aria-label="Open Vidhira AI Chat"
            >
                <MessageCircle size={32} />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] glass-card flex flex-col z-50 animate-slide-up no-print p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Vidhira AI Companion</h3>
                        <button onClick={toggleChat} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl">&times;</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <ChatMessageBubble key={index} message={msg} />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask about your report..."
                                className="input-cosmic flex-1 !rounded-full"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-[--cosmic-purple] to-[--gold-accent] rounded-full flex items-center justify-center text-white transform hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
                                disabled={isLoading || !userInput.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
