-- Copyright © 2026 Lizalise Nzo & Dumabezwe Skele. All rights reserved.
-- Players may set only their own profile photo (single-column update via RPC;
-- a broad players UPDATE policy would expose team_id, rank_level, etc.).
create or replace function public.set_my_photo(p_path text)
returns json language plpgsql security definer set search_path to 'public' as $function$
declare v_id uuid;
begin
  select id into v_id from players where user_id = auth.uid() limit 1;
  if v_id is null then return json_build_object('ok', false, 'error', 'No player linked to this account'); end if;
  if p_path is not null and split_part(p_path, '/', 1) <> v_id::text then
    return json_build_object('ok', false, 'error', 'Invalid photo path');
  end if;
  update players set photo_url = p_path where id = v_id;
  return json_build_object('ok', true);
end $function$;
revoke execute on function public.set_my_photo(text) from public, anon;
grant execute on function public.set_my_photo(text) to authenticated;
