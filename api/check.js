import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { image } = req.body;
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key is missing");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // В 2026 году используем актуальную версию модели
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        });

        const parts = image.split(',');
        const mimeType = parts[0].match(/:(.*?);/)[1];
        const base64Data = parts[1];

        const prompt = "Ты — эксперт по аутентификации. Проверь эту бирку. Напиши ОРИГИНАЛ или ПОДДЕЛКА и кратко объясни почему.";

        // Улучшенный формат запроса для версии 1.5
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            },
            { text: prompt },
        ]);

        const response = await result.response;
        res.status(200).json({ result: response.text() });

    } catch (error) {
        console.error("Ошибка детально:", error);
        res.status(500).json({ error: "Ошибка API: " + error.message });
    }
}