import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/useAuth';
import './globals.css';

export const metadata = {
  title: 'Finbytes — Media & Research',
  description: 'Business intelligence, analysis, and editorial insights for ambitious professionals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground [font-family:var(--ff-sans)]">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}