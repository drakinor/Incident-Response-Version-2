// Test script to list available models
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.argv[2];
    
    if (!apiKey) {
        console.log('Usage: node test-models.js YOUR_API_KEY');
        process.exit(1);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing different model names...\n');
    
    const modelsToTry = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'models/gemini-pro',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash'
    ];
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "test successful"');
            const text = result.response.text();
            console.log(`✅ SUCCESS: ${modelName} works!`);
            console.log(`   Response: ${text}\n`);
            break; // Found a working model!
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
}

listModels().catch(console.error);
