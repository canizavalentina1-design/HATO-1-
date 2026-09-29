import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function RebanioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  const { data: animals } = organizationId ? await supabase.from('animals').select('visual_id, sex, breed, status, birth_date').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(20) : { data: [] };
  return <main className="content standalone"><header><div><p className="eyebrow">REBAÑO</p><h1>Animales</h1><p className="muted">Registro de hacienda de carne.</p></div><button className="button">＋ Registrar animal</button></header><div className="panel table-panel">{animals?.length ? <table><thead><tr><th>Identificación</th><th>Sexo</th><th>Raza</th><th>Estado</th><th>Nacimiento</th></tr></thead><tbody>{animals.map(animal => <tr key={animal.visual_id}><td>{animal.visual_id}</td><td>{animal.sex === 'female' ? 'Hembra' : animal.sex === 'male' ? 'Macho' : 'Sin definir'}</td><td>{animal.breed || '—'}</td><td>{animal.status}</td><td>{animal.birth_date || '—'}</td></tr>)}</tbody></table> : <div className="empty"><div className="empty-icon">牛</div><h3>El rebaño está vacío</h3><p>Registrá el primer animal para comenzar a construir el stock.</p><button className="button">Registrar animal</button></div>}</div></main>;
}
