import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import MovementForm from './rebanio/movement-form';

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  const { data: farms } = organizationId ? await supabase.from('farms').select('id,name').eq('organization_id', organizationId).limit(1) : { data: [] };
  const farm = farms?.[0];
  const { data: animals } = organizationId ? await supabase.from('animals').select('sex,status').eq('organization_id', organizationId) : { data: [] };
  const { count: movementCount } = organizationId ? await supabase.from('stock_movements').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId) : { count: 0 };
  const active = animals?.filter(a => a.status === 'active') || [];
  const females = active.filter(a => a.sex === 'female').length;
  const males = active.filter(a => a.sex === 'male').length;
  return <main className="shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">H</span><span>Hato</span></div><p className="eyebrow">GESTIÓN GANADERA</p><nav><a className="active" href="/app">Resumen</a><a href="/app/rebanio">Rebaño</a><a href="/app/rebanio">Movimientos</a><a href="/app/campos">Campos</a><a href="/app/finanzas">Finanzas</a><a href="/app/configuracion">Configuración</a></nav><div className="tenant"><span className="avatar">{(user.email?.[0] || 'U').toUpperCase()}</span><div><strong>{user.email}</strong><small>{farm?.name || 'Sesión activa'}</small></div></div></aside><section className="content"><header><div><p className="eyebrow">PANEL DE OPERACIÓN</p><h1>{farm?.name || 'Tu organización'}</h1><p className="muted">Indicadores calculados con datos reales de Supabase.</p></div>{organizationId && farm?.id && <MovementForm organizationId={organizationId} farmId={farm.id}/>}</header><div className="kpi-grid"><div className="panel kpi"><span>Animales activos</span><strong>{active.length}</strong></div><div className="panel kpi"><span>Hembras</span><strong>{females}</strong></div><div className="panel kpi"><span>Machos</span><strong>{males}</strong></div><div className="panel kpi"><span>Movimientos</span><strong>{movementCount || 0}</strong></div></div><div className="panel"><div className="section-heading"><div><p className="eyebrow">DATOS OPERATIVOS</p><h2>Resumen del rebaño</h2></div><a className="button secondary" href="/app/rebanio">Ver rebaño</a></div>{active.length ? <p className="muted">El panel refleja {active.length} animales activos registrados en esta organización.</p> : <div className="empty"><div className="empty-icon">H</div><h3>Todavía no hay animales registrados</h3><p>Comenzá desde Rebaño para agregar animales y movimientos.</p><a className="button" href="/app/rebanio">Ir a Rebaño</a></div>}</div></section></main>;
}
