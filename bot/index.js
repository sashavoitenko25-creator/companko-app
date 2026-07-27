const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    {
        polling: true
    }
);

// ← сюда вставь свой канал
const CHANNEL = "@eiyatyt";

bot.onText(/\/start/, async (msg) => {

    await bot.sendMessage(
        msg.chat.id,

`👋 Добро пожаловать в Я тут!

📍 Находите людей рядом
🔥 Без переписок и лайков
💬 Только живое общение

Перед использованием необходимо подписаться на наш канал.`,

        {
            reply_markup: {
                inline_keyboard: [

                    [
                        {
                            text: "📢 Подписаться",
                            url: `https://t.me/${CHANNEL.replace("@","")}`
                        }
                    ],

                    [
                        {
                            text: "✅ Проверить подписку",
                            callback_data: "check_sub"
                        }
                    ]

                ]
            }
        }

    );

});

bot.on("callback_query", async (query) => {

    if (query.data !== "check_sub")
        return;

    try {

        const member =
            await bot.getChatMember(
                CHANNEL,
                query.from.id
            );

        if (
            member.status === "left" ||
            member.status === "kicked"
        ) {

            return bot.answerCallbackQuery(
                query.id,
                {
                    text: "❌ Сначала подпишитесь на канал.",
                    show_alert: true
                }
            );

        }

        await bot.editMessageReplyMarkup(
            {
                inline_keyboard: [
                    [
                        {
                            text: "🚀 Открыть Companko",
                            web_app: {
                                url: "https://companko-qqupoep0s-companko-app.vercel.app/"
                            }
                        }
                    ]
                ]
            },
            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id
            }
        );

        bot.answerCallbackQuery(
            query.id,
            {
                text: "✅ Подписка подтверждена!"
            }
        );

    } catch (e) {

        console.log(e);

        bot.answerCallbackQuery(
            query.id,
            {
                text: "Ошибка проверки.",
                show_alert: true
            }
        );

    }

});