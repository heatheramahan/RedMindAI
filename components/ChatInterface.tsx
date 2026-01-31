
import React, { useState, useRef, useEffect } from 'react';
import { Author, Message } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (input: string) => void;
}

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    // A more robust regex to prevent incorrect list formatting inside code blocks
    const formattedContent = content
      .replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="bg-black/50 p-3 rounded-md font-mono text-sm my-2 overflow-x-auto"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
      .replace(/`([^`]+)`/g, '<code class="bg-black/50 px-1 py-0.5 rounded font-mono text-xs text-brand-accent">$1</code>')
      .replace(/^\s*# (.*$)/gim, '<h1 class="text-2xl font-bold my-2">$1</h1>')
      .replace(/^\s*## (.*$)/gim, '<h2 class="text-xl font-bold my-2 border-b border-brand-border pb-1">$1</h2>')
      .replace(/^\s*### (.*$)/gim, '<h3 class="text-lg font-semibold my-2">$1</h3>')
      .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('<pre')
      .map((part, index) => {
        if (index === 0) return part.replace(/\n/g, '<br />');
        const [code, rest] = part.split('</pre>');
        return `<pre${code}</pre>${rest.replace(/\n/g, '<br />')}`;
      }).join('');

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    return (
        <div className="h-full flex flex-col relative bg-brand-surface">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.author === Author.USER ? 'justify-end' : ''}`}>
                        {msg.author === Author.BOT && <div className="w-8 h-8 flex-shrink-0 bg-brand-accent rounded-full flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>}
                        <div className={`max-w-2xl p-4 rounded-lg text-brand-text text-sm leading-relaxed ${msg.author === Author.BOT ? 'bg-brand-bg rounded-tl-none' : 'bg-brand-accent text-white rounded-br-none'}`}>
                           <MarkdownContent content={msg.content} />
                        </div>
                         {msg.author === Author.USER && <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center text-white"><UserIcon className="w-5 h-5"/></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 flex-shrink-0 bg-brand-accent rounded-full flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>
                        <div className="max-w-xl p-4 rounded-lg bg-brand-bg rounded-tl-none flex items-center gap-2">
                           <SpinnerIcon className="animate-spin w-5 h-5 text-brand-text-secondary"/>
                           <span className="text-brand-text-secondary text-sm">Analyzing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-brand-border bg-brand-surface/80 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="flex items-start gap-2 border border-brand-border rounded-lg p-2 bg-brand-bg focus-within:border-brand-accent transition-colors">
                    <textarea
                        ref={textAreaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a follow-up question about the findings..."
                        rows={1}
                        className="flex-1 bg-transparent text-brand-text placeholder-brand-text-secondary focus:outline-none resize-none text-sm max-h-32"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-md bg-brand-accent hover:bg-brand-accent-hover disabled:bg-brand-border disabled:cursor-not-allowed transition-colors self-end">
                        <SendIcon className="w-5 h-5 text-white"/>
                    </button>
                </form>
            </div>
        </div>
    );
};
