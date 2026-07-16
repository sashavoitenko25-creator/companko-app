-- ============================================
-- Companko
-- Profiles table
-- ============================================


create table if not exists profiles (

    id uuid primary key default gen_random_uuid(),


    user_id uuid not null
    references users(id)
    on delete cascade,


    name text not null,


    age integer,


    gender text,


    city text,


    about text,


    interests jsonb
    default '[]'::jsonb,


    favorite_activity text,


    created_at timestamptz
    default now(),


    updated_at timestamptz
    default now()

);





-- один пользователь = один профиль

create unique index if not exists profiles_user_id_unique

on profiles(user_id);





-- поиск пользователей по городу

create index if not exists profiles_city_idx

on profiles(city);





-- автоматическое обновление updated_at

create or replace function update_profiles_updated_at()

returns trigger

language plpgsql

as $$

begin

    new.updated_at = now();

    return new;

end;

$$;





create trigger profiles_updated_at_trigger


before update on profiles


for each row


execute function update_profiles_updated_at();