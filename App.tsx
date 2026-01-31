
import React, { useState, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { TaskInputModal } from './components/TaskInputModal';
import { Author, Message, TaskType, TaskPayload } from './types';
import { analyzeVulnerability, getFollowUpResponse } from './services/geminiService';


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { id: '1', author: Author.BOT, content: "Welcome to RedMind. I am your offensive AI pentesting assistant. Please select an analysis module from the left to begin." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  const handleTaskSelect = (taskType: TaskType) => {
      if (taskType === TaskType.EXPLOIT_RESEARCH) {
        setMessages([
          {
            id: Date.now().toString(),
            author: Author.BOT,
            content: "RedMind exploit database initialized. Ask me about public exploits, CVEs, attack techniques, or vulnerability research."
          }
        ]);
        setActiveTask(null);
      } else {
        setActiveTask(taskType);
      }
  };

  const handleTaskSubmit = useCallback(async (payload: TaskPayload) => {
      const userMessageContent = `Initiating task: **${payload.type}**...`;
      
      const userMessage: Message = {
          id: Date.now().toString(),
          author: Author.USER,
          content: userMessageContent,
          task: payload
      };
      
      setMessages(prev => [...prev, userMessage]);
      setActiveTask(null);
      setIsLoading(true);

      const analysisResult = await analyzeVulnerability(payload);
      
      const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: Author.BOT,
          content: analysisResult
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
  }, []);

  const handleSendMessage = async (input: string) => {
      if (!input.trim() || isLoading) return;

      const newUserMessage: Message = {
          id: Date.now().toString(),
          author: Author.USER,
          content: input.trim(),
      };

      setMessages(prev => [...prev, newUserMessage]);
      setIsLoading(true);

      const botResponse = await getFollowUpResponse(messages, newUserMessage.content);

      const newBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: Author.BOT,
          content: botResponse,
      };

      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl h-[95vh] flex border border-brand-border rounded-lg shadow-2xl bg-brand-surface overflow-hidden">
        {activeTask && <TaskInputModal task={activeTask} onSubmit={handleTaskSubmit} onCancel={() => setActiveTask(null)}/>}
        <Sidebar onTaskSelect={handleTaskSelect} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>
    </div>
  );
};

export default App;