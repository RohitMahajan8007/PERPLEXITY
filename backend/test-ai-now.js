import 'dotenv/config';
import { generateResponse, generateChatTitle } from './src/services/ai.service.js';

async function test() {
    try {
        console.log("Testing Title Generation...");
        const title = await generateChatTitle("Hello world, are you working?");
        console.log("Title result:", title);

        console.log("Testing Chat Response...");
        const response = await generateResponse([{ role: "user", content: "Say 'Hello I am alive'" }]);
        console.log("Chat Response:", response);
    } catch (e) {
        console.error("Test Error:", e.message);
    }
}
test();
