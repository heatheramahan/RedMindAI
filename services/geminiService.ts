
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TaskPayload, TaskType, Message, Author } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly without a valid API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'YOUR_API_KEY_HERE' });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const buildPrompt = async (payload: TaskPayload): Promise<(string | { inlineData: { data: string; mimeType: string; } })[]> => {
    const commonInstruction = "You are RedMind, an expert AI offensive security specialist and red teamer. Analyze the following data with a hacker's mindset and provide a detailed vulnerability report. Format your response in Markdown.";

    switch (payload.type) {
        case TaskType.STATIC_ANALYSIS:
            const staticSystemInstruction = `System: You are RedMind, an AI Pentest Agent.
When analyzing JavaScript code (file or URL):
1. Identify potential attack surfaces (dangerous sinks, DOM inputs, hardcoded secrets, insecure logic).
2. Suggest safe example payloads for manual testing (do not execute them).
3. Generate manual reproduction steps a human researcher can follow (Browser console or script execution).
4. Provide expected results that confirm the vulnerability (e.g., successful alert, data leakage, unauthorized function call).
5. Recommend secure coding practices to mitigate the issue.

Special Rules for URL Analysis:
1. Fetch the full raw source code from the provided URL (simulated if content is missing).
2. Normalize the code (prettify, de-obfuscate, expand minified functions).
3. Apply identical detection rules to local file analysis.`;

            if (payload.file) {
                const fileContent = await payload.file.text();
                return [`${staticSystemInstruction}\n\n**TASK: Static Vulnerability Detection (File Upload)**\n\nAnalyze the following code from the file named '${payload.file.name}' for static vulnerabilities.\n\n---\nCODE CONTENT:\n\`\`\`javascript\n${fileContent}\n\`\`\`\n---`];
            }
            if (payload.url) {
                let fetchedContent = "";
                try {
                    const response = await fetch(payload.url);
                    if (response.ok) {
                        fetchedContent = await response.text();
                    } else {
                        fetchedContent = `[System Notice: HTTP ${response.status} received when fetching ${payload.url}. Simulation Mode Activated.]`;
                    }
                } catch (e) {
                    fetchedContent = `[System Notice: CORS or Network Error prevented direct fetching of ${payload.url}. Simulation Mode Activated.]`;
                }

                return [`${staticSystemInstruction}\n\n**TASK: Static Vulnerability Detection (URL Endpoint)**\n\nTarget URL: ${payload.url}\n\n${fetchedContent !== "" ? `SOURCE CODE DETECTED:\n\`\`\`javascript\n${fetchedContent}\n\`\`\`` : "No source code available due to fetch error. Perform an architectural risk assessment based on the URL context and common vulnerabilities associated with similar endpoints."}`];
            }
            return ["Invalid static analysis request."];

        case TaskType.INJECTION_ANALYSIS:
            const injectionSystemInstruction = `System: You are RedMind, an AI Offensive Pentest Agent.
You are acting as an automated injection scanner. Your goal is to scan provided endpoints/requests for multiple injection vectors including SQLi, NoSQLi, Command Injection (CMD), LDAP Injection, XXE, SSTI, Header Injection, Path Traversal, HTML Injection, and XSS.

For each scan finding, follow this 5-step structured Pentest Report format:
1. **Attack Surface Identification**: Pinpoint specific parameters, headers, cookies, or body fields vulnerable to injection.
2. **Safe Test Payloads**: Provide a list of payloads designed to confirm the vulnerability safely (e.g., sleep/delay based, non-destructive echo, OOB DNS).
3. **Manual Reproduction (Burp Suite)**: Detailed steps to reproduce the finding using Burp Suite Repeater or Intruder.
4. **Evidence & Expected Result**: Describe what a successful exploit looks like (e.g., database error, delayed response time, reflection of specific tags).
5. **Remediation & Secure Coding**: Provide concrete code examples on how to fix the vulnerability (e.g., parameterized queries, input validation, output encoding).

Simulate a thorough multi-stage scan (Payload Generation -> Mutation for WAF Bypass -> Analysis of Response Anomalies).`;

            return [`${injectionSystemInstruction}

**TARGET SCAN DATA:**
- **Raw Input (Endpoints/Burp Export):**
\`\`\`
${payload.rawInput}
\`\`\`
- **Authentication Context:** \`${payload.authHeaders}\`

Execute the automated scan simulation and provide the final vulnerability report.`];

        case TaskType.ACCESS_CONTROL:
            return [`System: You are RedMind, an AI Pentest Agent built using the Agent Development Kit (ADK). 
Your goal is to test API endpoints for Broken Access Control vulnerabilities.

Workflow:
1. InputAgent: Accept and normalize inputs.
2. ReplayAgent: Replay requests with Guest, User, and Admin roles.
3. MutationAgent: Modify IDs and Roles.
4. ComparatorAgent: Flag privilege escalation or unauthorized access.
5. ReportAgent: Output structured report in Markdown.

---
**TARGET DATA FOR ANALYSIS:**
- **Raw Input (API/Burp):** 
\`\`\`
${payload.rawInput}
\`\`\`
- **Admin Authentication:** \`${payload.adminAuth}\`
- **User Authentication:** \`${payload.userAuth}\`

Perform the full 5-agent workflow and generate the report. Focus exclusively on Broken Access Control.`];

        case TaskType.DIRECTORY_BRUTEFORCE:
            return [`${commonInstruction}\n\nTask: Directory Bruteforce Simulation\n\nI am targeting the following base URL: \`${payload.url}\`\n\nAct like a directory bruteforcing tool (e.g., gobuster, dirsearch, ffuf). Your task is to generate a list of *enabled* or *existing* directories and files. Focus only on paths that would likely return a non-404 status code.\n\nInstructions:\n1. Simulate Discovery.\n2. Assign realistic Status Codes (200, 301, 403).\n3. Provide Rationale.\n4. Format as a Report with [Status Code] [Path] entries.`];
            
        case TaskType.DIAGRAM_ANALYSIS:
            const imagePart = await fileToGenerativePart(payload.file);
            return [
                `${commonInstruction}\n\nTask: Diagram & Image-Based Vulnerability Analysis\n\nAnalyze the attached architecture/dataflow diagram. Identify potential dynamic vulnerabilities by interpreting data flows, trust boundaries, and network components.`,
                imagePart
            ];

        default:
            return ["Unknown task."];
    }
};

export const analyzeVulnerability = async (payload: TaskPayload): Promise<string> => {
    try {
        const promptParts = await buildPrompt(payload);
        const model = payload.type === TaskType.DIAGRAM_ANALYSIS ? 'gemini-3-pro-image-preview' : 'gemini-3-pro-preview';
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: model,
          contents: { parts: promptParts.map(p => typeof p === 'string' ? { text: p } : p) },
        });
        return response.text || "Analysis failed: No content returned from the model.";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return error instanceof Error ? `Error: ${error.message}` : "An unknown error occurred.";
    }
};

export const getFollowUpResponse = async (chatHistory: Message[], newUserQuery: string): Promise<string> => {
    const lastBotMessage = chatHistory.filter((m) => m.author === Author.BOT).pop();
    if (!lastBotMessage) return "Please start a task first.";
    const prompt = `You are RedMind, an expert AI red teamer. Context: ${lastBotMessage.content}\n\nUser Question: ${newUserQuery}`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
        });
        return response.text || "No response generated.";
    } catch (error) {
        return "An error occurred during follow-up.";
    }
};
