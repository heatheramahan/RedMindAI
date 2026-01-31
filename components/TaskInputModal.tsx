
import React, { useState } from 'react';
import { TaskPayload, TaskType } from '../types';

interface TaskInputModalProps {
    task: TaskType;
    onSubmit: (payload: TaskPayload) => void;
    onCancel: () => void;
}

export const TaskInputModal: React.FC<TaskInputModalProps> = ({ task, onSubmit, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [rawInput, setRawInput] = useState('');
    const [adminAuth, setAdminAuth] = useState('');
    const [userAuth, setUserAuth] = useState('');
    const [authHeaders, setAuthHeaders] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let payload: TaskPayload | null = null;
        switch (task) {
            case TaskType.STATIC_ANALYSIS:
                if (file || url) payload = { type: TaskType.STATIC_ANALYSIS, file: file || undefined, url: url || undefined };
                break;
            case TaskType.ACCESS_CONTROL:
                if (rawInput) payload = { type: TaskType.ACCESS_CONTROL, rawInput, adminAuth, userAuth };
                break;
            case TaskType.INJECTION_ANALYSIS:
                if (rawInput) payload = { type: TaskType.INJECTION_ANALYSIS, rawInput, authHeaders };
                break;
            case TaskType.DIRECTORY_BRUTEFORCE:
                if (url) payload = { type: TaskType.DIRECTORY_BRUTEFORCE, url };
                break;
            case TaskType.DIAGRAM_ANALYSIS:
                if (file) payload = { type: TaskType.DIAGRAM_ANALYSIS, file };
                break;
        }
        if (payload) {
            onSubmit(payload);
        }
    };
    
    const renderForm = () => {
        switch(task) {
            case TaskType.STATIC_ANALYSIS:
                return (
                    <>
                        <p className="text-sm text-brand-text-secondary mb-4">Upload a file (.js, .ts, etc.) or enter an endpoint URL for analysis.</p>
                        <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="mb-2 w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-white hover:file:bg-brand-accent-hover"/>
                        <div className="flex items-center my-4">
                            <hr className="w-full border-brand-border"/>
                            <span className="px-2 text-xs text-brand-text-secondary">OR</span>
                            <hr className="w-full border-brand-border"/>
                        </div>
                        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://target.com/script.js" className="w-full bg-brand-bg border border-brand-border rounded p-2 text-sm"/>
                    </>
                );
            case TaskType.ACCESS_CONTROL:
                return (
                    <>
                        <p className="text-sm text-brand-text-secondary mb-4">Provide API definitions (JSON/YAML) or Burp Suite HTTP request exports for the RedMind agents to analyze.</p>
                        <label className="text-xs text-brand-text-secondary uppercase font-bold mb-1 block">API Definition / Burp Export</label>
                        <textarea 
                            value={rawInput} 
                            onChange={(e) => setRawInput(e.target.value)} 
                            rows={6}
                            placeholder="GET /api/v1/user/settings HTTP/1.1&#10;Host: target.com&#10;..."
                            className="w-full bg-brand-bg border font-mono border-brand-border rounded p-2 text-xs mb-4"
                        ></textarea>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-brand-text-secondary uppercase font-bold mb-1 block">Admin Auth (Token/Cookie)</label>
                                <input 
                                    type="text" 
                                    value={adminAuth} 
                                    onChange={(e) => setAdminAuth(e.target.value)} 
                                    placeholder="Bearer admin_jwt..." 
                                    className="w-full bg-brand-bg border font-mono border-brand-border rounded p-2 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-brand-text-secondary uppercase font-bold mb-1 block">User Auth (Token/Cookie)</label>
                                <input 
                                    type="text" 
                                    value={userAuth} 
                                    onChange={(e) => setUserAuth(e.target.value)} 
                                    placeholder="Bearer user_jwt..." 
                                    className="w-full bg-brand-bg border font-mono border-brand-border rounded p-2 text-xs"
                                />
                            </div>
                        </div>
                    </>
                );
            case TaskType.INJECTION_ANALYSIS:
                return (
                    <>
                        <p className="text-sm text-brand-text-secondary mb-4">Provide endpoints or Burp exports. RedMind will perform automated injection testing across multiple vectors (SQLi, NoSQL, CMD, XSS, etc.).</p>
                        <label className="text-xs text-brand-text-secondary uppercase font-bold mb-1 block">Endpoints / Burp Export</label>
                        <textarea 
                            value={rawInput} 
                            onChange={(e) => setRawInput(e.target.value)} 
                            rows={6}
                            placeholder="POST /api/search HTTP/1.1&#10;Content-Type: application/json&#10;&#10;{&quot;query&quot;: &quot;test&quot;}"
                            className="w-full bg-brand-bg border font-mono border-brand-border rounded p-2 text-xs mb-4"
                        ></textarea>
                        
                        <label className="text-xs text-brand-text-secondary uppercase font-bold mb-1 block">Authentication Context</label>
                        <input 
                            type="text" 
                            value={authHeaders} 
                            onChange={(e) => setAuthHeaders(e.target.value)} 
                            placeholder="Cookie: session=xyz; Authorization: Bearer jwt..." 
                            className="w-full bg-brand-bg border font-mono border-brand-border rounded p-2 text-xs"
                        />
                    </>
                );
            case TaskType.DIAGRAM_ANALYSIS:
                 return (
                    <>
                        <p className="text-sm text-brand-text-secondary mb-4">Upload a diagram or image file (.png, .jpg, .svg) for analysis.</p>
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="mb-2 w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-white hover:file:bg-brand-accent-hover"/>
                    </>
                );
            case TaskType.DIRECTORY_BRUTEFORCE:
                return (
                    <>
                        <p className="text-sm text-brand-text-secondary mb-4">Enter the base URL of the target to search for common directories and files.</p>
                        <label className="text-xs text-brand-text-secondary">Target URL</label>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)} 
                            placeholder="https://example.com" 
                            className="w-full bg-brand-bg border border-brand-border rounded p-2 text-sm"
                        />
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-brand-surface rounded-lg shadow-xl p-6 w-full max-w-xl border border-brand-border animate-fade-in">
                <h2 className="text-lg font-bold mb-2">{task}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="my-4">{renderForm()}</div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-brand-border hover:bg-brand-border/70 text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold text-sm">Start Analysis</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
