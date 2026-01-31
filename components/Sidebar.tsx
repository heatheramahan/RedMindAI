
import React from 'react';
import { TaskType } from '../types';
import { CodeIcon } from './icons/CodeIcon';
import { LockIcon } from './icons/LockIcon';
import { DiagramIcon } from './icons/DiagramIcon';
import { ChatIcon } from './icons/ChatIcon';
import { DirectoryIcon } from './icons/DirectoryIcon';
import { TerminalIcon } from './icons/TerminalIcon';

interface SidebarProps {
    onTaskSelect: (taskType: TaskType) => void;
}

const TaskButton: React.FC<{ onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ onClick, icon, children }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 text-left p-3 hover:bg-brand-border/50 rounded-lg transition-colors text-sm text-brand-text-secondary hover:text-brand-text"
    >
        {icon}
        <span>{children}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ onTaskSelect }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-black/20 p-4 flex flex-col gap-8 border-r border-brand-border">
            <header className="flex items-center gap-3">
                <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse"></div>
                <h1 className="text-xl font-bold text-brand-text tracking-wider">RedMind</h1>
                <span className="text-xs text-brand-accent font-mono ml-auto bg-brand-border/50 px-1.5 py-0.5 rounded">v1.1</span>
            </header>

            <nav>
                <h2 className="text-xs font-bold text-brand-text-secondary tracking-widest uppercase mb-3 px-3">Analysis Modules</h2>
                <div className="flex flex-col gap-1">
                    <TaskButton onClick={() => onTaskSelect(TaskType.EXPLOIT_RESEARCH)} icon={<ChatIcon className="w-5 h-5" />}>
                        Exploit Research
                    </TaskButton>
                    <TaskButton onClick={() => onTaskSelect(TaskType.STATIC_ANALYSIS)} icon={<CodeIcon className="w-5 h-5" />}>
                        Static Analysis
                    </TaskButton>
                    <TaskButton onClick={() => onTaskSelect(TaskType.ACCESS_CONTROL)} icon={<LockIcon className="w-5 h-5" />}>
                        Access Control
                    </TaskButton>
                    <TaskButton onClick={() => onTaskSelect(TaskType.INJECTION_ANALYSIS)} icon={<TerminalIcon className="w-5 h-5" />}>
                        Injection Analysis
                    </TaskButton>
                    <TaskButton onClick={() => onTaskSelect(TaskType.DIRECTORY_BRUTEFORCE)} icon={<DirectoryIcon className="w-5 h-5" />}>
                        Directory Bruteforce
                    </TaskButton>
                    <TaskButton onClick={() => onTaskSelect(TaskType.DIAGRAM_ANALYSIS)} icon={<DiagramIcon className="w-5 h-5" />}>
                        Diagram Analysis
                    </TaskButton>
                </div>
            </nav>
        </aside>
    );
};
