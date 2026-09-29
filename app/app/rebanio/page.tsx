import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import AnimalForm from './animal-form';
import MovementForm from './movement-form';
import RebanioTable from './rebanio-table';

export default async function RebanioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  const { data: farms } = organizationId ? await supabase.from('farms').select('id').eq('organization_id', organizationId).limit(1) : { data: [] };
  const farmId = farms?.[0]?.id;
  const { data: animals } = organizationId ? await supabase.from('animals').select('visual_id,electronic_id,name,sex,breed,category,location,group_name,status').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(500) : { data: [] };
  return <main className="content standalone"><header><div><p className="eyebrow">REBAÑO</p><h1>Animales</h1><p className="muted">Registro de hacienda de carne.</p></div>{organizationId && farmId && <div className="action-row"><MovementForm organizationId={organizationId} farmId={farmId}/><AnimalForm organizationId={organizationId} farmId={farmId}/></div>}</header><div className="panel table-panel"><RebanioTable animals={animals || []}/></div></main>;
}
