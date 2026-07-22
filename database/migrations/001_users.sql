-- ============================================
-- Companko
-- Users table
-- ============================================


create table if not exists users (

    id uuid primary key default gen_random_uuid(),


    telegram_id bigint unique not null,


    first_name text,


    photo_url text,


    language_code text default 'ru',


    created_at timestamptz
    default now(),


    updated_at timestamptz
    default now()

);



-- индекс для быстрого поиска Telegram пользователя

create index if not exists users_telegram_id_idx

on users(telegram_id);





-- автоматическое обновление updated_at

create or replace function update_users_updated_at()

returns trigger

language plpgsql

as $$

begin

    new.updated_at = now();

    return new;

end;

$$;





create trigger users_updated_at_trigger


before update on users


for each row


execute function update_users_updated_at();