
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, UserData, WorldClassReport } from '../../types';
import { getChatResponse } from '../../services/geminiService';
import ChatMessageBubble from './ChatMessage';
import TypingIndicator from './TypingIndicator';

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
        scrollToBottom();
    }, [messages, isLoading]);

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
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-cosmic-gold to-lunar-grey/50 rounded-full text-white shadow-2xl shadow-cosmic-gold/20 flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50 hover:shadow-[0_0_20px_var(--lucky-color-glow)]"
                aria-label="Open Vidhira AI Chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-deep-void" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-void-tint/80 backdrop-blur-2xl border border-lunar-grey/30 rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-lunar-grey/20">
                        <h3 className="font-display text-xl font-bold text-starlight">Vidhira AI Companion</h3>
                        <button onClick={toggleChat} className="text-starlight/70 hover:text-starlight text-2xl">&times;</button>
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
                    <div className="p-4 border-t border-lunar-grey/20">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask about your report..."
                                className="flex-1 bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-full px-4 py-2 focus:ring-2 focus:ring-cosmic-gold outline-none transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="w-10 h-10 flex-shrink-0 bg-cosmic-gold rounded-full flex items-center justify-center text-deep-void transform hover:scale-110 transition-transform disabled:bg-lunar-grey disabled:scale-100 hover:shadow-[0_0_12px_var(--lucky-color-glow)]"
                                disabled={isLoading || !userInput.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
