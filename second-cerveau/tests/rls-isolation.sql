-- Manual database check. Only synthetic users and rows are used.
-- The deliberately raised exception rolls back every fixture and role change.
-- No existing user payload is read, changed or deleted.
create or replace function pg_temp.check_second_brain_rls()
returns jsonb language plpgsql security invoker as $$
declare
  account_a uuid:=gen_random_uuid();
  account_b uuid:=gen_random_uuid();
  account_c uuid:=gen_random_uuid();
  affected integer;
  report jsonb:='{}'::jsonb;
begin
  begin
    insert into auth.users(id,email) values
      (account_a,account_a::text||'@example.invalid'),
      (account_b,account_b::text||'@example.invalid'),
      (account_c,account_c::text||'@example.invalid');
    insert into public.second_brain_sync(user_id,payload,device_label)
      values(account_b,'{"fixture":"B"}'::jsonb,'isolated-rls-fixture');
    perform set_config('request.jwt.claim.sub',account_a::text,true);
    perform set_config('request.jwt.claims',jsonb_build_object('sub',account_a,'role','authenticated')::text,true);
    execute 'set local role authenticated';

    select count(*) into affected from public.second_brain_sync where user_id=account_b;
    if affected<>0 then raise exception 'RLS test failed: cross-account select'; end if;
    report:=report||'{"cross_account_select_blocked":true}'::jsonb;
    insert into public.second_brain_sync(user_id,payload,device_label)
      values(account_a,'{"fixture":"A"}'::jsonb,'isolated-rls-fixture');
    select count(*) into affected from public.second_brain_sync where user_id=account_a;
    if affected<>1 then raise exception 'RLS test failed: own select/insert'; end if;
    report:=report||'{"own_select_insert_allowed":true}'::jsonb;
    update public.second_brain_sync set payload='{"fixture":"updated"}'::jsonb where user_id=account_a;
    get diagnostics affected=row_count;
    if affected<>1 then raise exception 'RLS test failed: own update'; end if;
    report:=report||'{"own_update_allowed":true}'::jsonb;
    update public.second_brain_sync set payload='{"fixture":"blocked"}'::jsonb where user_id=account_b;
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'RLS test failed: cross-account update'; end if;
    report:=report||'{"cross_account_update_blocked":true}'::jsonb;
    delete from public.second_brain_sync where user_id=account_b;
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'RLS test failed: cross-account delete'; end if;
    report:=report||'{"cross_account_delete_blocked":true}'::jsonb;
    begin
      insert into public.second_brain_sync(user_id,payload) values(account_c,'{}'::jsonb);
      raise exception 'RLS test failed: cross-account insert accepted';
    exception when insufficient_privilege then
      report:=report||'{"cross_account_insert_blocked":true}'::jsonb;
    end;
    begin
      update public.second_brain_sync set user_id=account_c where user_id=account_a;
      raise exception 'RLS test failed: owner reassignment accepted';
    exception when insufficient_privilege then
      report:=report||'{"owner_reassignment_blocked":true}'::jsonb;
    end;
    update public.second_brain_sync set payload='{}'::jsonb
      where user_id=account_a and updated_at='1970-01-01'::timestamptz;
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'RLS test failed: stale conditional write'; end if;
    report:=report||'{"stale_conditional_write_blocked":true}'::jsonb;
    delete from public.second_brain_sync where user_id=account_a;
    get diagnostics affected=row_count;
    if affected<>1 then raise exception 'RLS test failed: own delete'; end if;
    report:=report||'{"own_delete_allowed":true}'::jsonb;
    execute 'set local role anon';
    select count(*) into affected from public.second_brain_sync where user_id in(account_a,account_b);
    if affected<>0 then raise exception 'RLS test failed: anonymous select'; end if;
    report:=report||'{"anonymous_select_blocked":true}'::jsonb;
    raise exception using errcode='P5310',message='Rollback synthetic fixtures';
  exception when sqlstate 'P5310' then null;
  end;
  if exists(select 1 from auth.users where id in(account_a,account_b,account_c))
    or exists(select 1 from public.second_brain_sync where user_id in(account_a,account_b,account_c)) then
    raise exception 'RLS test failed: fixture rollback';
  end if;
  return report||'{"all_fixtures_rolled_back":true}'::jsonb;
end;
$$;
select pg_temp.check_second_brain_rls() as rls_test_result;
