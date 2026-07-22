const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    {
        polling:true
    }
);


bot.onText(
    /\/start/,
    (msg)=>{


        bot.sendMessage(

            msg.chat.id,

            'Добро пожаловать в Companko 👋',

            {
                reply_markup:{

                    inline_keyboard:[

                        [
                            {
                                text:'🚀 Открыть Companko',
                                web_app:{
                                    url:
                                    'https://companko-qqupoep0s-companko-app.vercel.app/'
                                }
                            }
                        ]

                    ]

                }

            }

        );


    }

);