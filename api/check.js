import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { image } = req.body;
    
    // Проверка ключа в логах (если пусто — значит переменная в Vercel не задана)
    if (!process.env.GEMINI_API_KEY) {
      console.error("Критическая ошибка: GEMINI_API_KEY отсутствует в переменных окружения!");
      return res.status(500).json({ error: 'Конфигурация сервера не завершена' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Попробуем модель gemini-1.5-flash (самая быстрая для фото)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts = image.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const base64Data = parts[1];

    const prompt = "Ты эксперт по одежде. Это оригинал или подделка? Проверь текст на бирке и качество. Ответь кратко.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    const text = result.response.text();
    res.status(200).json({ result: text });

  } catch (error) {
    console.error("Подробности ошибки:", error.message);
    res.status(500).json({ error: error.message });
  }
}
