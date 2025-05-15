import { GoogleGenerativeAI } from "@google/generative-ai";

// Use environment variable for API key or fallback for development purposes
const apiKey = process.env.GOOGLE_AI_KEY || "AIzaSyD8AdBo4rZRW_dsDzf1RVwpgBruAJNZ_mU";

// Check for API key
if (!apiKey) {
    console.error("Google AI API key is missing. Please set GOOGLE_AI_KEY in your environment.");
    process.exit(1);
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    responseMimeType: "application/json",
    temperature: 0.4,
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices. You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of development, you never miss the edge cases, and always write code that is scalable and maintainable. In your code, you always handle the errors and exceptions.

    Examples: 

    <example>
    response: {
        "text": "this is your fileTree structure of the express server",
        "fileTree": {
            "app.js": {
                file: {
                    contents: "const express = require('express'); const app = express(); app.get('/', (req, res) => { res.send('Hello World!'); }); app.listen(3000, () => { console.log('Server is running on port 3000'); });"
                }
            },
            "package.json": {
                file: {
                    contents: "{ \"name\": \"temp-server\", \"version\": \"1.0.0\", \"main\": \"index.js\", \"scripts\": { \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\" }, \"dependencies\": { \"express\": \"^4.21.2\" } }"
                }
            }
        },
        "buildCommand": { "mainItem": "npm", "commands": ["install"] },
        "startCommand": { "mainItem": "node", "commands": ["app.js"] }
    }
    </example>

    IMPORTANT: Don't use file names like routes/index.js. There will be no comments inside the code, only the code as shown in the example. No documentation, only code and the example response. Do NOT include '\\n', '\\r', or any line break characters in the response. Respond with code that has proper line breaks but WITHOUT '\\n' or '\\r' characters.`

});

// Function to generate content based on the prompt
export const generateResult = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        // Remove any literal '\n' or '\r' but keep actual line breaks
        responseText = responseText.replace(/(\\n|\\r)/g, '');
        return responseText;
    } catch (error) {
        console.error("Error generating content:", error.message);
        return `// Error: ${error.message}`;
    }
};
