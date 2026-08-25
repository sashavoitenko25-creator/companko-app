const STORAGE_KEY = 'app_notifications';

let notifications = load();

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function save() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notifications)
        );
    } catch (e) {
        console.warn('notification save error', e);
    }
}

function emit() {
    window.dispatchEvent(
        new CustomEvent('notifications:changed', {
            detail: {
                items: notifications.slice(),
                unread: getUnreadCount()
            }
        })
    );
}

export function getNotifications() {
    return notifications.slice();
}

export function getUnreadCount() {
    return notifications.filter(n => !n.read).length;
}

/**
 * payload:
 * {
 *   id?,
 *   type: 'route',
 *   from_user_id,
 *   name,
 *   age,
 *   photo_url,
 *   lat,
 *   lng,
 *   gender?,
 *   activity?,
 *   relationship_status?,
 *   expires_at?,
 *   duration?,
 *   read?,          // учитываем из БД
 *   created_at?,
 *   silent?         // true = не показывать toast (загрузка с сервера)
 * }
 */
export function addNotification(payload) {
    if (!payload) return null;

    const id =
        payload.id ||
        `n_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // уже есть по id — не дублируем
    if (notifications.some(n => String(n.id) === String(id))) {
        return null;
    }

    // не дублируем одно и то же от того же человека за последние 30 сек
    const exists = notifications.some(n =>
        n.from_user_id &&
        payload.from_user_id &&
        String(n.from_user_id) === String(payload.from_user_id) &&
        n.type === (payload.type || 'route') &&
        Date.now() - (n.created_at || 0) < 30000
    );

    if (exists) return null;

    const item = {
        id,
        type: payload.type || 'route',
        from_user_id: payload.from_user_id || null,
        name: payload.name || '',
        age: payload.age || '',
        photo_url: payload.photo_url || payload.photo || '',
        lat: payload.lat ?? null,
        lng: payload.lng ?? null,
        gender: payload.gender || null,
        activity: payload.activity || null,
        relationship_status: payload.relationship_status || null,
        expires_at: payload.expires_at || null,
        duration: payload.duration || null,
        // ВАЖНО: уважаем read из payload (БД)
        read: payload.read === true,
        created_at: payload.created_at || Date.now()
    };

    notifications = [item, ...notifications].slice(0, 50);
    save();
    emit();

    // toast только для реально новых (не silent)
    if (!payload.silent) {
        window.dispatchEvent(
            new CustomEvent('notification:new', {
                detail: item
            })
        );
    }

    return item;
}

export function markRead(id) {
    notifications = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
    );
    save();
    emit();
}

export function markAllRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
    save();
    emit();
}

export function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    save();
    emit();
}

export function clearNotifications() {
    notifications = [];
    save();
    emit();
}

/** Синхронизация локального списка с актуальными строками из БД */
export function syncFromServer(rows) {
    if (!Array.isArray(rows)) return;

    const byId = new Map(
        rows.map(r => [String(r.id), r])
    );

    // оставляем только те, что ещё есть на сервере, и обновляем read
    notifications = notifications
        .filter(n => byId.has(String(n.id)))
        .map(n => {
            const server = byId.get(String(n.id));
            return {
                ...n,
                read: !!server.read
            };
        });

    // добавляем новые с сервера (без toast)
    rows.forEach(row => {
        if (!notifications.some(n => String(n.id) === String(row.id))) {
            addNotification({
                ...row,
                silent: true
            });
        }
    });

    // если после filter/map что-то изменилось — уже save/emit внутри add
    // но на всякий случай:
    save();
    emit();
}