import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Vapt - Transporte Inteligente em Balsas',
  description: 'Envie cargas de todos os tamanhos com frete conjunto, cálculo transparente e economia na região de Balsas.',
  icons: {
    icon: '/logotipo.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

