-- Copyright © 2026 Lizalise Nzo & Dumabezwe Skele. All rights reserved.
-- Add the player's photo path to the player_card payload.
create or replace function public.player_card(p_player uuid default null)
returns json language plpgsql stable security definer set search_path to 'public' as $function$
declare target uuid; tid uuid; ok boolean; rec record;
begin
  target := coalesce(p_player, (select id from players where user_id = auth.uid() limit 1));
  if target is null then return null; end if;
  select p.team_id, p.position, p.strong_foot, p.weak_foot, p.height_cm, p.weight_kg, p.photo_url, u.name
    into rec from players p join users u on u.id = p.user_id where p.id = target;
  tid := rec.team_id;
  ok := exists (select 1 from players where id = target and user_id = auth.uid())
     or current_role_of() = 'admin'
     or exists (select 1 from teams where id = tid and coach_id = auth.uid());
  if not ok then return null; end if;
  return json_build_object(
    'name', rec.name, 'position', rec.position,
    'strong_foot', rec.strong_foot, 'weak_foot', rec.weak_foot,
    'height_cm', rec.height_cm, 'weight_kg', rec.weight_kg,
    'photo_url', rec.photo_url,
    'attributes', coalesce((select json_object_agg(attribute, rating) from player_attributes where player_id = target), '{}'::json)
  );
end; $function$;
grant execute on function public.player_card(uuid) to authenticated;
