-- ============================================
-- Companko
-- Live sessions table
-- ============================================


create table if not exists live_sessions (


    id uuid primary key default gen_random_uuid(),



    user_id uuid not null

    references users(id)

    on delete cascade,



    activity text not null,



    expires_at timestamptz not null,



    latitude double precision not null,



    longitude double precision not null,



    is_active boolean default true,



    created_at timestamptz

    default now()



);





-- быстрый поиск активных пользователей

create index if not exists live_sessions_active_idx


on live_sessions(is_active);





-- поиск по времени окончания

create index if not exists live_sessions_expires_idx


on live_sessions(expires_at);





-- поиск рядом по координатам

create index if not exists live_sessions_location_idx


on live_sessions(latitude, longitude);





-- автоматически выключаем просроченные LIVE


create or replace function deactivate_expired_sessions()


returns trigger

language plpgsql

as $$

begin


    update live_sessions


    set is_active = false


    where expires_at < now()

    and is_active = true;



    return new;


end;


$$;