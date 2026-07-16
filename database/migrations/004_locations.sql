-- ============================================
-- Companko
-- Locations table
-- ============================================


create table if not exists locations (


    id uuid primary key default gen_random_uuid(),



    user_id uuid not null

    references users(id)

    on delete cascade,



    latitude double precision not null,



    longitude double precision not null,



    accuracy double precision,



    updated_at timestamptz

    default now()



);





-- один пользователь = одна текущая позиция

create unique index if not exists locations_user_unique

on locations(user_id);





-- быстрый поиск координат

create index if not exists locations_coordinates_idx

on locations(latitude, longitude);





-- автоматическое обновление времени


create or replace function update_locations_updated_at()

returns trigger

language plpgsql

as $$

begin


    new.updated_at = now();


    return new;


end;


$$;





create trigger locations_updated_at_trigger


before update on locations


for each row


execute function update_locations_updated_at();