import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cookies, headers } from 'next/headers';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: {
    template: '%s | Discount Granada',
    default: 'Discount Granada'
  },
  description: 'Encuentra las mejores ofertas y descuentos en Granada!'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

async function detectLanguage() {
  const cookieStore = cookies();
  const langCookie = (await cookieStore).get('lang');
  if (langCookie) return langCookie.value;
  
  const headerList = headers();
  const acceptLanguage = (await headerList).get('accept-language');
  return acceptLanguage?.startsWith('es') ? 'es' : 'en';
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await detectLanguage();
  const [user, team] = await Promise.all([getUser(), getTeamForUser()]);

  return (
    <html lang={lang} className={`${manrope.className}`}>
      <body className="min-h-[100dvh] bg-gray-50 text-black dark:bg-gray-950 dark:text-white">
        <LanguageProvider initialLanguage={lang}>
          <SWRConfig
            value={{
              fallback: {
                '/api/user': user,
                '/api/team': team
              }
            }}
          >
            {children}
            <ToastContainer
              position="bottom-right"
              theme="light"
              className="text-md"
              newestOnTop={false}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </SWRConfig>
        </LanguageProvider>
      </body>
    </html>
  );
}