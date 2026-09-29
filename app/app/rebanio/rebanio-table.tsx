'use client';

import { useMemo, useState } from 'react';

type Animal = {
  id: string;
  visual_id: string; electronic_id: string | null; name: string | null;
  sex: string; category: string | null; breed: string | null;
  location: string | null; group_name: string | null; status: string;
};

const sexLabel: Record<string, string> = { female: 'Hembra', male: 'Macho', unknown: 'Sin definir' };

export default function RebanioTable({ animals }: { animals: Animal[] }) {
  const [query, setQuery] = useState('');
  const [sex, setSex] = useState('all');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => animals.filter((a) => {
    const haystack = [a.visual_id, a.electronic_id, a.name, a.category, a.breed, a.location, a.group_name].filter(Boolean).join(' ').toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (sex === 'all' || a.sex === sex) && (status === 'all' || a.status === status);
  }), [animals, query, sex, status]);
  function downloadCsv() {
    const header = ['Identificación','Microchip','Nombre','Sexo','Categoría','Raza','Localización','Grupo','Estado'];
    const rows = filtered.map(a => [a.visual_id, a.electronic_id || '', a.name || '', sexLabel[a.sex] || a.sex, a.category || '', a.breed || '', a.location || '', a.group_name || '', a.status]);
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'rebanio.csv'; link.click(); URL.revokeObjectURL(url);
  }
  return <>
    <div className="table-toolbar"><input aria-label="Buscar animales" placeholder="Buscar por identificación, nombre, raza…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filtrar por sexo" value={sex} onChange={e => setSex(e.target.value)}><option value="all">Todos los sexos</option><option value="female">Hembras</option><option value="male">Machos</option><option value="unknown">Sin definir</option></select><select aria-label="Filtrar por estado" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Todos los estados</option><option value="active">Activos</option><option value="sold">Vendidos</option><option value="dead">Bajas</option><option value="transferred">Transferidos</option></select><button className="button secondary" onClick={downloadCsv}>Exportar CSV</button></div>
    {filtered.length ? <><p className="table-result">Mostrando {filtered.length} de {animals.length} animales</p><table><thead><tr><th>Identificación</th><th>Microchip</th><th>Nombre</th><th>Sexo</th><th>Edad</th><th>Categoría</th><th>Raza</th><th>Localización</th><th>Grupo</th><th>Estado</th><th>Ficha</th></tr></thead><tbody>{filtered.map(a=><tr key={a.visual_id}><td>{a.visual_id}</td><td>{a.electronic_id||'—'}</td><td>{a.name||'—'}</td><td>{sexLabel[a.sex]||'Sin definir'}</td><td>—</td><td>{a.category||'—'}</td><td>{a.breed||'—'}</td><td>{a.location||'—'}</td><td>{a.group_name||'—'}</td><td>{a.status}</td><td><a href={`/app/rebanio/animal/${a.id}`}>Ver</a></td></tr>)}</tbody></table></> : <div className="empty"><h3>{animals.length ? 'No hay coincidencias' : 'El rebaño está vacío'}</h3><p>{animals.length ? 'Probá con otro filtro o búsqueda.' : 'Registrá el primer animal o movimiento para comenzar.'}</p></div>}
  </>;
}
