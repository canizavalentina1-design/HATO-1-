import './globals.css';
import './auth.css';
import './table.css';
import './dashboard.css';
import './rebanio.css';
import './catalogos.css';
import './farms.css';
import './modules.css';

export const metadata = { title: 'Hato', description: 'Gestión ganadera de carne' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
