
export enum Author {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  author: Author;
  content: string;
  task?: TaskPayload;
}

export enum TaskType {
  STATIC_ANALYSIS = 'Static Vulnerability Detection',
  ACCESS_CONTROL = 'Access Control Analysis',
  INJECTION_ANALYSIS = 'Injection Attack Analysis',
  DIRECTORY_BRUTEFORCE = 'Directory Bruteforce',
  DIAGRAM_ANALYSIS = 'Diagram & Image-Based Analysis',
  EXPLOIT_RESEARCH = 'Exploit Research',
}

export interface StaticAnalysisPayload {
    type: TaskType.STATIC_ANALYSIS;
    file?: File;
    url?: string;
}

export interface AccessControlPayload {
    type: TaskType.ACCESS_CONTROL;
    rawInput: string;
    adminAuth: string;
    userAuth: string;
}

export interface InjectionAnalysisPayload {
    type: TaskType.INJECTION_ANALYSIS;
    rawInput: string;
    authHeaders: string;
}

export interface DiagramAnalysisPayload {
    type: TaskType.DIAGRAM_ANALYSIS;
    file: File;
}

export interface DirectoryBruteforcePayload {
    type: TaskType.DIRECTORY_BRUTEFORCE;
    url: string;
}

export interface ExploitResearchPayload {
    type: TaskType.EXPLOIT_RESEARCH;
}

export type TaskPayload = 
    | StaticAnalysisPayload 
    | AccessControlPayload 
    | InjectionAnalysisPayload
    | DiagramAnalysisPayload 
    | DirectoryBruteforcePayload 
    | ExploitResearchPayload;
