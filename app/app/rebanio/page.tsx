import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import AnimalForm from './animal-form';

export default async function RebanioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  const { data: farms } = organizationId ? await supabase.from('farms').select('id').eq('organization_id', organizationId).limit(1) : { data: [] };
  const farmId = farms?.[0]?.id;
  const { data: animals } = organizationId ? await supabase.from('animals').select('visual_id, electronic_id, name, sex, breed, category, location, group_name, status, birth_date').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(50) : { data: [] };
  return <main className="content standalone"><header><div><p className="eyebrow">REBAÑO</p><h1>Animales</h1><p className="muted">Registro de hacienda de carne.</p></div>{organizationId && farmId && <AnimalForm organizationId={organizationId} farmId={farmId} />}</header><div className="panel table-panel">{animals?.length ? <table><thead><tr><th>Identificación</th><th>Microchip</th><th>Nombre</th><th>Sexo</th><th>Categoría</th><th>Raza</th><th>Localización</th><th>Grupo</th><th>Estado</th></tr></thead><tbody>{animals.map(animal => <tr key={animal.visual_id}><td>{animal.visual_id}</td><td>{animal.electronic_id || '—'}</td><td>{animal.name || '—'}</td><td>{animal.sex === 'female' ? 'Hembra' : animal.sex === 'male' ? 'Macho' : 'Sin definir'}</td><td>{animal.category || '—'}</td><td>{animal.breed || '—'}</td><td>{animal.location || '—'}</td><td>{animal.group_name || '—'}</td><td>{animal.status}</td></tr>)}</tbody></table> : <div className="empty"><div className="empty-icon">牛</div><h3>El rebaño está vacío</h3><p>Registrá el primer animal para comenzar a construir el stock.</p>{organizationId && farmId && <AnimalForm organizationId={organizationId} farmId={farmId} />}</div>}</div></main>;
}
