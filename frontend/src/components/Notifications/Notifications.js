import './Notifications.css';

import {
    getNotifications,
    getUnreadCount,
    addNotification,
    removeNotification,
    markRead,
    markAllRead
} from '../../store/notificationStore';

import {
    markRouteNotificationRead,
    deleteRouteNotification
} from '../../services/supabase/routeNotificationService';

import {
    getMap
} from '../../services/map/mapService';

import {
    showUserCard
} from '../../features/profile/SelectedUser';

import {
    checkActiveLive
} from '../../services/supabase/liveSessionService';

import {
    t
} from '../../i18n';

let initialized = false;

/* ========================================
   HTML
======================================== */

export function Notifications() {

    setTimeout(initNotifications, 0);

    return `
<button
    type="button"
    class="notif-btn"
    id="notif-btn"
    aria-label="${t('notifications_aria')}"
>
    <svg
        class="notif-btn__icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"
            fill="currentColor"
        />
        <path
            d="M18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
            fill="currentColor"
        />
    </svg>
    <span class="notif-btn__badge" id="notif-badge" hidden>0</span>
</button>

<div id="notif-panel" class="notif-panel">
    <div class="notif-panel__header">
        <h2 id="notif-panel-title">${t('notifications_title')}</h2>
        <button
            type="button"
            class="notif-panel__close"
            id="notif-panel-close"
            aria-label="${t('close')}"
        >×</button>
    </div>
    <div class="notif-panel__list" id="notif-list"></div>
</div>

<div id="notif-toast" class="notif-toast" hidden>
    <div class="notif-toast__avatar-wrap">
        <img class="notif-toast__avatar" id="notif-toast-avatar" alt="" />
    </div>
    <div class="notif-toast__body">
        <div class="notif-toast__title" id="notif-toast-title"></div>
        <div class="notif-toast__text" id="notif-toast-text"></div>
    </div>
</div>
`;
}

/* ========================================
   INIT
======================================== */

export function initNotifications() {

    if (initialized) return;
    initialized = true;

    const btn = document.querySelector('#notif-btn');
    const panel = document.querySelector('#notif-panel');
    const closeBtn = document.querySelector('#notif-panel-close');

    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
    });

    closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
    });

    document.addEventListener('click', (e) => {
        if (!panel.classList.contains('open')) return;

        const inside =
            panel.contains(e.target) ||
            btn.contains(e.target);

        if (!inside) closePanel();
    });

    window.addEventListener('ui:close-all', closePanel);

    window.addEventListener('notifications:changed', () => {
        renderList();
        updateBadge();
    });

    window.addEventListener('notification:new', (e) => {
        showToast(e.detail);
        updateBadge();
        renderList();
    });

    window.addEventListener('language:changed', () => {
        updateTexts();
        renderList();
    });

    window.addEventListener('notification:push', (e) => {
        if (e.detail) addNotification(e.detail);
    });

    renderList();
    updateBadge();
    updateTexts();
}

/* ========================================
   SETTINGS / FILTERS
======================================== */

function closeSettings() {
    const settings = document.querySelector('#settings-window');
    const settingsButton = document.querySelector('#settings-button');

    if (settings) {
        settings.classList.remove('open');
    }

    if (settingsButton) {
        settingsButton.classList.remove('open-state');
        settingsButton.blur();
    }
}

function hideFiltersTrigger() {
    const trigger = document.querySelector('.filters-trigger');
    if (!trigger) return;

    trigger.style.opacity = '0';
    trigger.style.pointerEvents = 'none';
    trigger.style.transform = 'translateY(16px)';
    trigger.style.transition = 'opacity .2s ease, transform .2s ease';
}

function showFiltersTrigger() {
    const trigger = document.querySelector('.filters-trigger');
    if (!trigger) return;

    trigger.style.opacity = '';
    trigger.style.pointerEvents = '';
    trigger.style.transform = '';
}

/* ========================================
   PANEL
======================================== */

function togglePanel() {
    const panel = document.querySelector('#notif-panel');
    const btn = document.querySelector('#notif-btn');
    if (!panel) return;

    if (panel.classList.contains('open')) {
        closePanel();
        return;
    }

    closeSettings();
    window.dispatchEvent(new Event('ui:close-all'));

    hideFiltersTrigger();

    panel.classList.add('open');
    btn?.classList.add('open-state');

    // локально + на сервер
    const unreadIds = getNotifications()
        .filter(n => !n.read)
        .map(n => n.id);

    markAllRead();

    unreadIds.forEach(id => {
        markRouteNotificationRead(id).catch(() => {});
    });

    renderList();
    updateBadge();
}

function closePanel() {
    const panel = document.querySelector('#notif-panel');
    const btn = document.querySelector('#notif-btn');

    panel?.classList.remove('open');
    btn?.classList.remove('open-state');

    showFiltersTrigger();
}

/* ========================================
   RENDER LIST
======================================== */

function renderList() {
    const list = document.querySelector('#notif-list');
    if (!list) return;

    const items = getNotifications();

    if (!items.length) {
        list.innerHTML = `
            <div class="notif-empty">
                <div class="notif-empty__icon">🔔</div>
                <div class="notif-empty__text">${t('notifications_empty')}</div>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const photo =
            item.photo_url ||
            'https://i.pravatar.cc/100';

        const age =
            item.age
                ? `, ${escapeHTML(item.age)}`
                : '';

        const subtitle =
            item.type === 'route'
                ? t('notifications_route_text')
                : t('notifications_default_text');

        return `
            <div
                class="notif-item ${item.read ? '' : 'notif-item--unread'}"
                data-id="${escapeHTML(item.id)}"
            >
                <img
                    class="notif-item__avatar"
                    src="${escapeHTML(photo)}"
                    alt=""
                />
                <div class="notif-item__content">
                    <div class="notif-item__name">
                        ${escapeHTML(item.name || t('guest'))}${age}
                    </div>
                    <div class="notif-item__text">
                        ${subtitle}
                    </div>
                </div>
                <button
                    type="button"
                    class="notif-item__delete"
                    data-delete="${escapeHTML(item.id)}"
                    aria-label="${t('notifications_delete')}"
                >×</button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.notif-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('[data-delete]')) return;

            const id = el.dataset.id;
            const item = getNotifications().find(n => n.id === id);
            if (!item) return;

            handleOpenNotification(item);
        });
    });

    list.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.delete;
            removeNotification(id);
            deleteRouteNotification(id).catch(() => {});
        });
    });
}

/* ========================================
   OPEN → map + card (через 2.5 сек)
======================================== */

async function handleOpenNotification(item) {
    closePanel();
    markRead(item.id);
    markRouteNotificationRead(item.id).catch(() => {});

    const map = getMap();
    const lat = Number(item.lat);
    const lng = Number(item.lng);

    if (
        map &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
    ) {
        map.flyTo([lat, lng], 16, {
            animate: true,
            duration: 0.8
        });
    }

    setTimeout(async () => {
        const user = {
            user_id: item.from_user_id,
            id: item.from_user_id,
            name: item.name,
            age: item.age,
            photo_url: item.photo_url,
            photo: item.photo_url,
            lat: item.lat,
            lng: item.lng,
            gender: item.gender,
            activity: item.activity,
            relationship_status: item.relationship_status,
            expires_at: item.expires_at || null,
            duration: item.duration || null,
            distance: 0
        };

        // подтягиваем актуальный LIVE, чтобы таймер работал
        if (item.from_user_id) {
            try {
                const session = await checkActiveLive(item.from_user_id);

                if (session) {
                    user.activity =
                        session.activity ||
                        user.activity;

                    user.expires_at =
                        session.expires_at ||
                        user.expires_at;

                    user.duration =
                        session.duration ||
                        user.duration;

                    user.isLive = true;
                }
            } catch (error) {
                console.warn(
                    'Notification live load error',
                    error
                );
            }
        }

        showUserCard(user);
    }, 2500);
}

/* ========================================
   BADGE
======================================== */

function updateBadge() {
    const badge = document.querySelector('#notif-badge');
    if (!badge) return;

    const count = getUnreadCount();

    if (count > 0) {
        badge.hidden = false;
        badge.textContent = count > 9 ? '9+' : String(count);
    } else {
        badge.hidden = true;
    }
}

/* ========================================
   TOAST
======================================== */

let toastTimer = null;

function showToast(item) {
    if (!item) return;

    const toast = document.querySelector('#notif-toast');
    const avatar = document.querySelector('#notif-toast-avatar');
    const title = document.querySelector('#notif-toast-title');
    const text = document.querySelector('#notif-toast-text');

    if (!toast || !title || !text) return;

    if (avatar) {
        avatar.src =
            item.photo_url ||
            'https://i.pravatar.cc/100';
    }

    const age = item.age ? `, ${item.age}` : '';
    title.textContent = `${item.name || t('guest')}${age}`;
    text.textContent = t('notifications_route_toast');

    toast.hidden = false;
    requestAnimationFrame(() => {
        toast.classList.add('notif-toast--show');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('notif-toast--show');
        setTimeout(() => {
            toast.hidden = true;
        }, 280);
    }, 3500);

    toast.onclick = () => {
        clearTimeout(toastTimer);
        toast.classList.remove('notif-toast--show');
        toast.hidden = true;
        handleOpenNotification(item);
    };
}

/* ========================================
   TEXTS
======================================== */

function updateTexts() {
    const title = document.querySelector('#notif-panel-title');
    if (title) title.textContent = t('notifications_title');

    const btn = document.querySelector('#notif-btn');
    if (btn) btn.setAttribute('aria-label', t('notifications_aria'));

    const closeBtn = document.querySelector('#notif-panel-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('close'));
}

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}