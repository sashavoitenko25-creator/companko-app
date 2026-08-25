import {
    supabase
} from './supabaseClient';

/**
 * Отправить уведомление о маршруте получателю
 */
export async function sendRouteNotification(payload) {

    if (!payload?.to_user_id || !payload?.from_user_id) {
        console.warn('sendRouteNotification: missing user ids');
        return null;
    }

    const row = {
        to_user_id: payload.to_user_id,
        from_user_id: payload.from_user_id,
        name: payload.name || null,
        age: payload.age != null ? Number(payload.age) : null,
        photo_url: payload.photo_url || null,
        lat: payload.lat != null ? Number(payload.lat) : null,
        lng: payload.lng != null ? Number(payload.lng) : null,
        gender: payload.gender || null,
        activity: payload.activity || null,
        relationship_status: payload.relationship_status || null,
        read: false
    };

    const {
        data,
        error
    } = await supabase
        .from('route_notifications')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('sendRouteNotification error:', error);
        return null;
    }

    return data;
}

/**
 * Загрузить свои уведомления
 */
export async function fetchMyRouteNotifications(myUserId) {

    if (!myUserId) return [];

    const {
        data,
        error
    } = await supabase
        .from('route_notifications')
        .select('*')
        .eq('to_user_id', myUserId)
        .order('created_at', {
            ascending: false
        })
        .limit(50);

    if (error) {
        console.error('fetchMyRouteNotifications error:', error);
        return [];
    }

    return data || [];
}

/**
 * Пометить одно уведомление прочитанным
 */
export async function markRouteNotificationRead(id) {

    if (!id) return;

    const {
        error
    } = await supabase
        .from('route_notifications')
        .update({
            read: true
        })
        .eq('id', id);

    if (error) {
        console.error('markRouteNotificationRead error:', error);
    }
}

/**
 * Пометить все свои уведомления прочитанными
 */
export async function markAllRouteNotificationsRead(myUserId) {

    if (!myUserId) return;

    const {
        error
    } = await supabase
        .from('route_notifications')
        .update({
            read: true
        })
        .eq('to_user_id', myUserId)
        .eq('read', false);

    if (error) {
        console.error('markAllRouteNotificationsRead error:', error);
    }
}

/**
 * Удалить уведомление
 */
export async function deleteRouteNotification(id) {

    if (!id) return;

    const {
        error
    } = await supabase
        .from('route_notifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteRouteNotification error:', error);
    }
}

/**
 * Realtime: новые уведомления для меня
 * onInsert(row) вызывается при каждом INSERT
 * Возвращает channel — его можно отписать через supabase.removeChannel
 */
export function subscribeRouteNotifications(myUserId, onInsert) {

    if (!myUserId || typeof onInsert !== 'function') {
        return null;
    }

    const channel = supabase
        .channel(`route_notifications:${myUserId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'route_notifications',
                filter: `to_user_id=eq.${myUserId}`
            },
            (payload) => {
                if (payload?.new) {
                    onInsert(payload.new);
                }
            }
        )
        .subscribe((status) => {
            console.log('route_notifications realtime:', status);
        });

    return channel;
}

/**
 * Строка из БД → формат notificationStore
 */
export function mapRouteNotificationRow(row) {

    if (!row) return null;

    return {
        id: row.id,
        type: 'route',
        from_user_id: row.from_user_id,
        name: row.name || '',
        age: row.age || '',
        photo_url: row.photo_url || '',
        lat: row.lat,
        lng: row.lng,
        gender: row.gender || null,
        activity: row.activity || null,
        relationship_status: row.relationship_status || null,
        read: !!row.read,
        created_at: row.created_at
            ? new Date(row.created_at).getTime()
            : Date.now()
    };
}