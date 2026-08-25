const STORAGE_KEY = 'app_lang';


const translations = {

    /* =====================================================
       RUSSIAN
    ====================================================== */

    ru: {

        // Settings
        settings_title: '⚙ Настройки',
        change_language: '🌐 Сменить язык',
        report_problem: '🐞 Сообщить о проблеме',
        suggest_idea: '💡 Предложить идею',

        // Language modal
        language_title: '🌐 Язык',
        language_uk: 'Украинский',
        language_ru: 'Русский',
        language_en: 'Английский',
        language_de: 'Немецкий',

        // Feedback
        feedback_problem: '🐞 Сообщить о проблеме',
        feedback_idea: '💡 Предложить идею',
        feedback_placeholder: 'Опишите подробнее...',
        feedback_send: 'Отправить',
        feedback_thanks: '✅ Спасибо!\n\nВаше сообщение успешно отправлено.\n\nМы обязательно его рассмотрим ❤️',

        // BottomBar
        find_me: 'Найти себя',
        settings_aria: 'Настройки',
        live: 'LIVE',
        stop_live: 'STOP LIVE',
        location_error: 'Ошибка поиска местоположения',

        // Header
        online: 'Онлайн',

        // Notifications
        notifications_aria: 'Уведомления',
        notifications_title: 'Уведомления',
        notifications_empty: 'Пока нет уведомлений',
        notifications_delete: 'Удалить',
        notifications_route_text: 'Построил к вам маршрут',
        notifications_route_toast: 'К вам построили маршрут 📍',
        notifications_default_text: 'Новое уведомление',

        // UserCard
        guest: 'Гость',
        meters: 'м',
        active_for: 'Активен ещё',
        minutes: 'мин',
        build_route: 'Построить маршрут',

        // LiveModal
        start_live_title: 'Начать LIVE',
        what_to_do: 'Чем хотите заняться?',
        activity_beer: 'Выпить',
        activity_beer_sub: '(алкоголь)',
        activity_coffee: 'Выпить',
        activity_coffee_sub: '(кофе)',
        activity_walk: 'Гулять',
        activity_chat: 'Общаться',
        how_long: 'Сколько времени?',
        min_15: '15 мин',
        min_30: '30 мин',
        min_60: '60 мин',
        start_live_btn: 'Начать LIVE',

        // FilterPanel
        filters_title: 'Фильтры',
        filters_close: 'Закрыть',
        filters_busy_with: 'Чем заняты',
        filters_age: 'Возраст',
        filters_age_from: 'От',
        filters_age_to: 'До',
        filters_relationship: 'Статус отношений',
        filters_radius: 'Радиус',
        filters_reset: 'Сбросить',
        filters_apply: 'Применить',
        filters_btn: 'Фильтры',
        filters_btn_active: 'Фильтры •',
        activity_filter_beer: '🍺 Выпить',
        activity_filter_coffee: '☕ Кофе',
        activity_filter_walk: '🚶 Гулять',
        activity_filter_chat: '💬 Общаться',
        rel_single: '💔 Свободен / свободна',
        rel_relationship: '❤️ В отношениях',
        rel_married: '💍 Женат / замужем',
        rel_not_specified: '🤫 Не указано',
        radius_any: 'Любой',
        radius_500: '500 м',
        radius_1km: '1 км',
        radius_3km: '3 км',
        radius_5km: '5 км',
        radius_10km: '10 км',

        // Profile
        profile_edit: 'Редактирование',
        profile_create: 'Создание профиля',
        profile_subtitle: 'Как вас будут видеть другие',
        profile_name: 'Имя',
        profile_name_placeholder: 'Ваше имя',
        profile_age: 'Возраст',
        profile_age_placeholder: 'Возраст',
        profile_gender: 'Пол',
        profile_male: '👨 Парень',
        profile_female: '👩 Девушка',
        profile_relationship: 'Статус отношений',
        profile_save: 'Сохранить',
        profile_create_btn: 'Создать профиль',
        profile_close: 'Закрыть',
        rel_profile_relationship: '❤️ В отношениях',
        rel_profile_married: '💍 Женат / замужем',
        rel_profile_single: '💔 Свободен / свободна',
        rel_profile_not_specified: '🤫 Не хочу указывать',
        profile_err_name: 'Пожалуйста, укажите ваше имя',
        profile_err_age: 'Пожалуйста, укажите ваш возраст',
        profile_err_gender: 'Пожалуйста, укажите ваш пол',
        profile_err_age_invalid: 'Пожалуйста, укажите корректный возраст',
        profile_err_age_18: 'Приложением можно пользоваться только с 18 лет',
        profile_err_save: 'Ошибка сохранения',
        profile_err_tg: 'Пользователь Telegram не найден',

        // SelectedUser
        your_live: 'Ваш LIVE',
        distance_label: 'Расстояние',
        nearby: 'Рядом',
        status_label: 'Статус',
        wants_now: 'Сейчас хочет',
        time_left: 'осталось',
        activity_default: 'Активность',
        activity_name_beer: 'Выпить',
        activity_name_coffee: 'Выпить кофе',
        activity_name_walk: 'Гулять',
        activity_name_chat: 'Общаться',
        rel_card_relationship: 'В отношениях',
        rel_card_married_m: 'Женат',
        rel_card_married_f: 'Замужем',
        rel_card_single_m: 'Свободен',
        rel_card_single_f: 'Свободна',
        rel_card_not_specified: 'Не хочу указывать',
        active_now: 'Активен сейчас',
        status_looking: 'В поиске',
        status_only_chat: 'Только общение',
        status_open_m: 'Открыт к знакомствам',
        status_open_f: 'Открыта к знакомствам',
        status_complicated: 'Всё сложно',

        // RoutePanel
        route_title: 'Маршрут',
        route_foot: '🚶 Пешком',
        route_bike: '🚲 Велосипед',
        route_car: '🚗 Машина',
        route_cancel: 'Отменить',
        route_open: 'Открыть маршрут',
        route_building: 'Строим маршрут...',
        route_failed: 'Не удалось построить маршрут',
        route_live_required: 'Чтобы проложить маршрут, запустите Live',
        route_km: 'км',
        route_min: 'мин',

        // MyLiveCard
        end_live: '⛔ Закончить LIVE',
        live_timer: '🔥 LIVE',

        // BottomSheet
        bs_what_doing: 'Что делаешь?',
        bs_live_time: 'Время LIVE',
        bs_start: 'Запустить LIVE',
        bs_coffee: 'Кофе',
        bs_walk: 'Прогулка',
        bs_talk: 'Общение',
        bs_sport: 'Спорт',
        hour_1: '1 час',
        hour_2: '2 часа',

        // Common
        close: 'Закрыть',
        back: '←',

    },

    /* =====================================================
       ENGLISH
    ====================================================== */

    en: {

        // Settings
        settings_title: '⚙ Settings',
        change_language: '🌐 Change language',
        report_problem: '🐞 Report a problem',
        suggest_idea: '💡 Suggest an idea',

        // Language modal
        language_title: '🌐 Language',
        language_uk: 'Ukrainian',
        language_ru: 'Russian',
        language_en: 'English',
        language_de: 'German',

        // Feedback
        feedback_problem: '🐞 Report a problem',
        feedback_idea: '💡 Suggest an idea',
        feedback_placeholder: 'Describe in more detail...',
        feedback_send: 'Send',
        feedback_thanks: '✅ Thank you!\n\nYour message has been sent successfully.\n\nWe will review it ❤️',

        // BottomBar
        find_me: 'Find me',
        settings_aria: 'Settings',
        live: 'LIVE',
        stop_live: 'STOP LIVE',
        location_error: 'Location error',

        // Header
        online: 'Online',

        // Notifications
        notifications_aria: 'Notifications',
        notifications_title: 'Notifications',
        notifications_empty: 'No notifications yet',
        notifications_delete: 'Delete',
        notifications_route_text: 'Built a route to you',
        notifications_route_toast: 'Someone built a route to you 📍',
        notifications_default_text: 'New notification',

        // UserCard
        guest: 'Guest',
        meters: 'm',
        active_for: 'Active for',
        minutes: 'min',
        build_route: 'Get directions',

        // LiveModal
        start_live_title: 'Start LIVE',
        what_to_do: 'What do you want to do?',
        activity_beer: 'Have a drink',
        activity_beer_sub: '(alcohol)',
        activity_coffee: 'Have a drink',
        activity_coffee_sub: '(coffee)',
        activity_walk: 'Walk',
        activity_chat: 'Talk',
        how_long: 'How long?',
        min_15: '15 min',
        min_30: '30 min',
        min_60: '60 min',
        start_live_btn: 'Start LIVE',

        // FilterPanel
        filters_title: 'Filters',
        filters_close: 'Close',
        filters_busy_with: 'What they are doing',
        filters_age: 'Age',
        filters_age_from: 'From',
        filters_age_to: 'To',
        filters_relationship: 'Relationship status',
        filters_radius: 'Radius',
        filters_reset: 'Reset',
        filters_apply: 'Apply',
        filters_btn: 'Filters',
        filters_btn_active: 'Filters •',
        activity_filter_beer: '🍺 Drink',
        activity_filter_coffee: '☕ Coffee',
        activity_filter_walk: '🚶 Walk',
        activity_filter_chat: '💬 Talk',
        rel_single: '💔 Single',
        rel_relationship: '❤️ In a relationship',
        rel_married: '💍 Married',
        rel_not_specified: '🤫 Not specified',
        radius_any: 'Any',
        radius_500: '500 m',
        radius_1km: '1 km',
        radius_3km: '3 km',
        radius_5km: '5 km',
        radius_10km: '10 km',

        // Profile
        profile_edit: 'Edit profile',
        profile_create: 'Create profile',
        profile_subtitle: 'How others will see you',
        profile_name: 'Name',
        profile_name_placeholder: 'Your name',
        profile_age: 'Age',
        profile_age_placeholder: 'Age',
        profile_gender: 'Gender',
        profile_male: '👨 Guy',
        profile_female: '👩 Girl',
        profile_relationship: 'Relationship status',
        profile_save: 'Save',
        profile_create_btn: 'Create profile',
        profile_close: 'Close',
        rel_profile_relationship: '❤️ In a relationship',
        rel_profile_married: '💍 Married',
        rel_profile_single: '💔 Single',
        rel_profile_not_specified: '🤫 Prefer not to say',
        profile_err_name: 'Please enter your name',
        profile_err_age: 'Please enter your age',
        profile_err_gender: 'Please select your gender',
        profile_err_age_invalid: 'Please enter a valid age',
        profile_err_age_18: 'You must be 18 or older to use the app',
        profile_err_save: 'Save error',
        profile_err_tg: 'Telegram user not found',

        // SelectedUser
        your_live: 'Your LIVE',
        distance_label: 'Distance',
        nearby: 'Nearby',
        status_label: 'Status',
        wants_now: 'Wants now',
        time_left: 'left',
        activity_default: 'Activity',
        activity_name_beer: 'Have a drink',
        activity_name_coffee: 'Coffee',
        activity_name_walk: 'Walk',
        activity_name_chat: 'Talk',
        rel_card_relationship: 'In a relationship',
        rel_card_married_m: 'Married',
        rel_card_married_f: 'Married',
        rel_card_single_m: 'Single',
        rel_card_single_f: 'Single',
        rel_card_not_specified: 'Prefer not to say',
        active_now: 'Active now',
        status_looking: 'Looking',
        status_only_chat: 'Talk only',
        status_open_m: 'Open to meeting',
        status_open_f: 'Open to meeting',
        status_complicated: "It's complicated",

        // RoutePanel
        route_title: 'Route',
        route_foot: '🚶 Walk',
        route_bike: '🚲 Bike',
        route_car: '🚗 Car',
        route_cancel: 'Cancel',
        route_open: 'Open route',
        route_building: 'Building route...',
        route_failed: 'Could not build route',
        route_live_required: 'Start Live to get directions',
        route_km: 'km',
        route_min: 'min',

        // MyLiveCard
        end_live: '⛔ End LIVE',
        live_timer: '🔥 LIVE',

        // BottomSheet
        bs_what_doing: 'What are you doing?',
        bs_live_time: 'LIVE duration',
        bs_start: 'Start LIVE',
        bs_coffee: 'Coffee',
        bs_walk: 'Walk',
        bs_talk: 'Talk',
        bs_sport: 'Sport',
        hour_1: '1 hour',
        hour_2: '2 hours',

        // Common
        close: 'Close',
        back: '←',

    },

    /* =====================================================
       UKRAINIAN
    ====================================================== */

    uk: {

        // Settings
        settings_title: '⚙ Налаштування',
        change_language: '🌐 Змінити мову',
        report_problem: '🐞 Повідомити про проблему',
        suggest_idea: '💡 Запропонувати ідею',

        // Language modal
        language_title: '🌐 Мова',
        language_uk: 'Українська',
        language_ru: 'Російська',
        language_en: 'Англійська',
        language_de: 'Німецька',

        // Feedback
        feedback_problem: '🐞 Повідомити про проблему',
        feedback_idea: '💡 Запропонувати ідею',
        feedback_placeholder: 'Опишіть детальніше...',
        feedback_send: 'Надіслати',
        feedback_thanks: '✅ Дякуємо!\n\nВаше повідомлення успішно надіслано.\n\nМи обовʼязково його розглянемо ❤️',

        // BottomBar
        find_me: 'Знайти себе',
        settings_aria: 'Налаштування',
        live: 'LIVE',
        stop_live: 'STOP LIVE',
        location_error: 'Помилка пошуку місцезнаходження',

        // Header
        online: 'Онлайн',

        // Notifications
        notifications_aria: 'Сповіщення',
        notifications_title: 'Сповіщення',
        notifications_empty: 'Поки немає сповіщень',
        notifications_delete: 'Видалити',
        notifications_route_text: 'Побудував до вас маршрут',
        notifications_route_toast: 'До вас побудували маршрут 📍',
        notifications_default_text: 'Нове сповіщення',

        // UserCard
        guest: 'Гість',
        meters: 'м',
        active_for: 'Активний ще',
        minutes: 'хв',
        build_route: 'Побудувати маршрут',

        // LiveModal
        start_live_title: 'Почати LIVE',
        what_to_do: 'Чим хочете зайнятися?',
        activity_beer: 'Випити',
        activity_beer_sub: '(алкоголь)',
        activity_coffee: 'Випити',
        activity_coffee_sub: '(кава)',
        activity_walk: 'Гуляти',
        activity_chat: 'Спілкуватися',
        how_long: 'Скільки часу?',
        min_15: '15 хв',
        min_30: '30 хв',
        min_60: '60 хв',
        start_live_btn: 'Почати LIVE',

        // FilterPanel
        filters_title: 'Фільтри',
        filters_close: 'Закрити',
        filters_busy_with: 'Чим зайняті',
        filters_age: 'Вік',
        filters_age_from: 'Від',
        filters_age_to: 'До',
        filters_relationship: 'Статус стосунків',
        filters_radius: 'Радіус',
        filters_reset: 'Скинути',
        filters_apply: 'Застосувати',
        filters_btn: 'Фільтри',
        filters_btn_active: 'Фільтри •',
        activity_filter_beer: '🍺 Випити',
        activity_filter_coffee: '☕ Кава',
        activity_filter_walk: '🚶 Гуляти',
        activity_filter_chat: '💬 Спілкуватися',
        rel_single: '💔 Вільний / вільна',
        rel_relationship: '❤️ У стосунках',
        rel_married: '💍 Одружений / заміжня',
        rel_not_specified: '🤫 Не вказано',
        radius_any: 'Будь-який',
        radius_500: '500 м',
        radius_1km: '1 км',
        radius_3km: '3 км',
        radius_5km: '5 км',
        radius_10km: '10 км',

        // Profile
        profile_edit: 'Редагування',
        profile_create: 'Створення профілю',
        profile_subtitle: 'Як вас бачитимуть інші',
        profile_name: 'Імʼя',
        profile_name_placeholder: 'Ваше імʼя',
        profile_age: 'Вік',
        profile_age_placeholder: 'Вік',
        profile_gender: 'Стать',
        profile_male: '👨 Хлопець',
        profile_female: '👩 Дівчина',
        profile_relationship: 'Статус стосунків',
        profile_save: 'Зберегти',
        profile_create_btn: 'Створити профіль',
        profile_close: 'Закрити',
        rel_profile_relationship: '❤️ У стосунках',
        rel_profile_married: '💍 Одружений / заміжня',
        rel_profile_single: '💔 Вільний / вільна',
        rel_profile_not_specified: '🤫 Не хочу вказувати',
        profile_err_name: 'Будь ласка, вкажіть ваше імʼя',
        profile_err_age: 'Будь ласка, вкажіть ваш вік',
        profile_err_gender: 'Будь ласка, вкажіть вашу стать',
        profile_err_age_invalid: 'Будь ласка, вкажіть коректний вік',
        profile_err_age_18: 'Додатком можна користуватися лише з 18 років',
        profile_err_save: 'Помилка збереження',
        profile_err_tg: 'Користувача Telegram не знайдено',

        // SelectedUser
        your_live: 'Ваш LIVE',
        distance_label: 'Відстань',
        nearby: 'Поруч',
        status_label: 'Статус',
        wants_now: 'Зараз хоче',
        time_left: 'залишилось',
        activity_default: 'Активність',
        activity_name_beer: 'Випити',
        activity_name_coffee: 'Випити каву',
        activity_name_walk: 'Гуляти',
        activity_name_chat: 'Спілкуватися',
        rel_card_relationship: 'У стосунках',
        rel_card_married_m: 'Одружений',
        rel_card_married_f: 'Заміжня',
        rel_card_single_m: 'Вільний',
        rel_card_single_f: 'Вільна',
        rel_card_not_specified: 'Не хочу вказувати',
        active_now: 'Активний зараз',
        status_looking: 'У пошуку',
        status_only_chat: 'Тільки спілкування',
        status_open_m: 'Відкритий до знайомств',
        status_open_f: 'Відкрита до знайомств',
        status_complicated: 'Все складно',

        // RoutePanel
        route_title: 'Маршрут',
        route_foot: '🚶 Пішки',
        route_bike: '🚲 Велосипед',
        route_car: '🚗 Авто',
        route_cancel: 'Скасувати',
        route_open: 'Відкрити маршрут',
        route_building: 'Будуємо маршрут...',
        route_failed: 'Не вдалося побудувати маршрут',
        route_live_required: 'Щоб прокласти маршрут, запустіть Live',
        route_km: 'км',
        route_min: 'хв',

        // MyLiveCard
        end_live: '⛔ Завершити LIVE',
        live_timer: '🔥 LIVE',

        // BottomSheet
        bs_what_doing: 'Що робиш?',
        bs_live_time: 'Час LIVE',
        bs_start: 'Запустити LIVE',
        bs_coffee: 'Кава',
        bs_walk: 'Прогулянка',
        bs_talk: 'Спілкування',
        bs_sport: 'Спорт',
        hour_1: '1 година',
        hour_2: '2 години',

        // Common
        close: 'Закрити',
        back: '←',

    },

    /* =====================================================
       GERMAN
    ====================================================== */

    de: {

        // Settings
        settings_title: '⚙ Einstellungen',
        change_language: '🌐 Sprache ändern',
        report_problem: '🐞 Problem melden',
        suggest_idea: '💡 Idee vorschlagen',

        // Language modal
        language_title: '🌐 Sprache',
        language_uk: 'Ukrainisch',
        language_ru: 'Russisch',
        language_en: 'Englisch',
        language_de: 'Deutsch',

        // Feedback
        feedback_problem: '🐞 Problem melden',
        feedback_idea: '💡 Idee vorschlagen',
        feedback_placeholder: 'Beschreiben Sie genauer...',
        feedback_send: 'Senden',
        feedback_thanks: '✅ Danke!\n\nIhre Nachricht wurde erfolgreich gesendet.\n\nWir werden sie prüfen ❤️',

        // BottomBar
        find_me: 'Mich finden',
        settings_aria: 'Einstellungen',
        live: 'LIVE',
        stop_live: 'STOP LIVE',
        location_error: 'Standortfehler',

        // Header
        online: 'Online',

        // Notifications
        notifications_aria: 'Benachrichtigungen',
        notifications_title: 'Benachrichtigungen',
        notifications_empty: 'Noch keine Benachrichtigungen',
        notifications_delete: 'Löschen',
        notifications_route_text: 'Hat eine Route zu dir gebaut',
        notifications_route_toast: 'Jemand hat eine Route zu dir gebaut 📍',
        notifications_default_text: 'Neue Benachrichtigung',

        // UserCard
        guest: 'Gast',
        meters: 'm',
        active_for: 'Noch aktiv',
        minutes: 'Min.',
        build_route: 'Route berechnen',

        // LiveModal
        start_live_title: 'LIVE starten',
        what_to_do: 'Was möchtest du machen?',
        activity_beer: 'Trinken',
        activity_beer_sub: '(Alkohol)',
        activity_coffee: 'Trinken',
        activity_coffee_sub: '(Kaffee)',
        activity_walk: 'Spazieren',
        activity_chat: 'Unterhalten',
        how_long: 'Wie lange?',
        min_15: '15 Min',
        min_30: '30 Min',
        min_60: '60 Min',
        start_live_btn: 'LIVE starten',

        // FilterPanel
        filters_title: 'Filter',
        filters_close: 'Schließen',
        filters_busy_with: 'Womit beschäftigt',
        filters_age: 'Alter',
        filters_age_from: 'Von',
        filters_age_to: 'Bis',
        filters_relationship: 'Beziehungsstatus',
        filters_radius: 'Radius',
        filters_reset: 'Zurücksetzen',
        filters_apply: 'Anwenden',
        filters_btn: 'Filter',
        filters_btn_active: 'Filter •',
        activity_filter_beer: '🍺 Trinken',
        activity_filter_coffee: '☕ Kaffee',
        activity_filter_walk: '🚶 Spazieren',
        activity_filter_chat: '💬 Unterhalten',
        rel_single: '💔 Single',
        rel_relationship: '❤️ In einer Beziehung',
        rel_married: '💍 Verheiratet',
        rel_not_specified: '🤫 Nicht angegeben',
        radius_any: 'Beliebig',
        radius_500: '500 m',
        radius_1km: '1 km',
        radius_3km: '3 km',
        radius_5km: '5 km',
        radius_10km: '10 km',

        // Profile
        profile_edit: 'Bearbeiten',
        profile_create: 'Profil erstellen',
        profile_subtitle: 'So sehen dich andere',
        profile_name: 'Name',
        profile_name_placeholder: 'Dein Name',
        profile_age: 'Alter',
        profile_age_placeholder: 'Alter',
        profile_gender: 'Geschlecht',
        profile_male: '👨 Mann',
        profile_female: '👩 Frau',
        profile_relationship: 'Beziehungsstatus',
        profile_save: 'Speichern',
        profile_create_btn: 'Profil erstellen',
        profile_close: 'Schließen',
        rel_profile_relationship: '❤️ In einer Beziehung',
        rel_profile_married: '💍 Verheiratet',
        rel_profile_single: '💔 Single',
        rel_profile_not_specified: '🤫 Möchte ich nicht angeben',
        profile_err_name: 'Bitte gib deinen Namen ein',
        profile_err_age: 'Bitte gib dein Alter ein',
        profile_err_gender: 'Bitte wähle dein Geschlecht',
        profile_err_age_invalid: 'Bitte gib ein gültiges Alter ein',
        profile_err_age_18: 'Die App ist ab 18 Jahren nutzbar',
        profile_err_save: 'Fehler beim Speichern',
        profile_err_tg: 'Telegram-Benutzer nicht gefunden',

        // SelectedUser
        your_live: 'Dein LIVE',
        distance_label: 'Entfernung',
        nearby: 'In der Nähe',
        status_label: 'Status',
        wants_now: 'Möchte jetzt',
        time_left: 'übrig',
        activity_default: 'Aktivität',
        activity_name_beer: 'Trinken',
        activity_name_coffee: 'Kaffee',
        activity_name_walk: 'Spazieren',
        activity_name_chat: 'Unterhalten',
        rel_card_relationship: 'In einer Beziehung',
        rel_card_married_m: 'Verheiratet',
        rel_card_married_f: 'Verheiratet',
        rel_card_single_m: 'Single',
        rel_card_single_f: 'Single',
        rel_card_not_specified: 'Möchte ich nicht angeben',
        active_now: 'Jetzt aktiv',
        status_looking: 'Auf der Suche',
        status_only_chat: 'Nur Unterhalten',
        status_open_m: 'Offen für Kennenlernen',
        status_open_f: 'Offen für Kennenlernen',
        status_complicated: 'Alles kompliziert',

        // RoutePanel
        route_title: 'Route',
        route_foot: '🚶 Zu Fuß',
        route_bike: '🚲 Fahrrad',
        route_car: '🚗 Auto',
        route_cancel: 'Abbrechen',
        route_open: 'Route öffnen',
        route_building: 'Route wird berechnet...',
        route_failed: 'Route konnte nicht berechnet werden',
        route_live_required: 'Starte Live, um die Route zu berechnen',
        route_km: 'km',
        route_min: 'Min.',

        // MyLiveCard
        end_live: '⛔ LIVE beenden',
        live_timer: '🔥 LIVE',

        // BottomSheet
        bs_what_doing: 'Was machst du?',
        bs_live_time: 'LIVE-Dauer',
        bs_start: 'LIVE starten',
        bs_coffee: 'Kaffee',
        bs_walk: 'Spaziergang',
        bs_talk: 'Unterhalten',
        bs_sport: 'Sport',
        hour_1: '1 Stunde',
        hour_2: '2 Stunden',

        // Common
        close: 'Schließen',
        back: '←',

    }

};


/* =====================================================
   CURRENT LANGUAGE
===================================================== */

let currentLang =
    localStorage.getItem(
        STORAGE_KEY
    ) || 'ru';


/* =====================================================
   TRANSLATION
===================================================== */

export function t(key){

    const dict =
        translations[currentLang] ||
        translations.ru;


    return (
        dict[key] ??
        translations.ru[key] ??
        key
    );

}


/* =====================================================
   GET CURRENT LANGUAGE
===================================================== */

export function getLang(){

    return currentLang;

}


/* =====================================================
   SET LANGUAGE
===================================================== */

export function setLang(lang){

    if(!translations[lang])
        return;


    currentLang = lang;


    localStorage.setItem(
        STORAGE_KEY,
        lang
    );


    window.dispatchEvent(
        new CustomEvent(
            'language:changed',
            {
                detail: {
                    lang
                }
            }
        )
    );

}


/* =====================================================
   AVAILABLE LANGUAGES
===================================================== */

export function getAvailableLanguages(){

    return [

        {
            code: 'uk',
            label: t('language_uk')
        },

        {
            code: 'ru',
            label: t('language_ru')
        },

        {
            code: 'en',
            label: t('language_en')
        },

        {
            code: 'de',
            label: t('language_de')
        }

    ];

}