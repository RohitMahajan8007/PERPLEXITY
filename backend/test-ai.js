import 'dotenv/config';
import { generateResponse } from "./src/services/ai.service.js";
import fs from "fs";

async function run() {
    try {
        const dummyPdf = fs.readFileSync('package.json');  
        const messages = [
            {
                role: "user",
                content: "Hello, reply 'Test OK' if you get this messages."
            }
        ];
        console.log("Generating response...");
        const res = await generateResponse(messages);
        console.log("RESPONSE:", res);
    } catch (err) {
        console.error("ERROR:", err);
    }
}
run();
