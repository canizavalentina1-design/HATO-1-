import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import MovementForm from '../rebanio/movement-form';
import MovementsTable from './movements-table';

export default async function MovimientosPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/login');
  const {data:memberships}=await supabase.from('organization_members').select('organization_id').eq('user_id',user.id).limit(1); const organizationId=memberships?.[0]?.organization_id;
  const {data:farms}=organizationId?await supabase.from('farms').select('id').eq('organization_id',organizationId).limit(1):{data:[]}; const farmId=farms?.[0]?.id;
  const {data:movements}=organizationId?await supabase.from('stock_movements').select('id,movement_type,movement_date,quantity,notes').eq('organization_id',organizationId).order('movement_date',{ascending:false}).limit(500):{data:[]};
  return <main className="content standalone"><header><div><p className="eyebrow">REBAÑO</p><h1>Movimientos</h1><p className="muted">Entradas, salidas y ajustes registrados.</p></div>{organizationId&&farmId&&<MovementForm organizationId={organizationId} farmId={farmId}/>}</header><div className="panel table-panel"><MovementsTable movements={movements||[]}/></div></main>;
}
