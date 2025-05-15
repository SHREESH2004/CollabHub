const { exec } = require('child_process');

console.log("Running your code...");
setTimeout(() => {
    console.log("This is the worst code I've ever seen.");
    console.log("Shutting down VS Code for your own good...");

    // Command to close VS Code (works on most systems)
    exec('taskkill /IM Code.exe /F', (err) => {
        if (err) {
            console.error("Couldn't shut down VS Code. Even your code can't rage quit properly.");
        } else {
            console.log("VS Code has left the chat.");
        }
    });
}, 3000);