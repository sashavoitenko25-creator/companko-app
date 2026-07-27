export default async function handler(req, res) {

```
if (req.method !== 'POST') {

    return res.status(405).json({
        error: 'Method not allowed'
    });

}

try {

    const {
        type,
        text,
        user
    } = req.body || {};

    if (!type || !text) {

        return res.status(400).json({
            error: 'Missing data'
        });

    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_ID = '6859689857';

    if (!BOT_TOKEN) {

        return res.status(500).json({
            error: 'BOT_TOKEN not set'
        });

    }

    const title =
        type === 'problem'
            ? '🐞 ПРОБЛЕМА'
            : '💡 ИДЕЯ';

    const message = `
```

${title}

👤 ${user?.first_name || 'Пользователь'}
🆔 ${user?.id || 'unknown'}
📱 @${user?.username || 'нет username'}

${text}
`.trim();

```
    const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: message
            })
        }
    );

    const data = await response.json();

    if (!data.ok) {

        return res.status(500).json(data);

    }

    return res.status(200).json({
        ok: true
    });

} catch (error) {

    return res.status(500).json({
        error: error.message
    });

}
```

}
