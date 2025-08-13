'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, LogOut, HandCoins, Users, Settings, X, Menu, LogOutIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { useTranslation } from '@/hooks/useTranslation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());





function UserMenu() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();
  const t = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  async function handleSignOut() {
    mutate('/api/user', null, false);
    await signOut();
    router.push('/');
    router.refresh();
    setIsMenuOpen(false);
  }

  if (!user) {
    return (
      <>
        <Button asChild className="rounded-full cursor-pointer">
          <Link href="/sign-up">{t('sign up')}</Link>
        </Button>
        <Button className="rounded-full bg-white border-4 border-gray-200 hover:bg-gray-200 cursor-pointer text-black">
          <Link href="/sign-in">{t('sign in')}</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
            {user.email.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/profile" className="flex w-full items-center" onClick={() => setIsMenuOpen(false)}>
            <Users className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('sign_out')}</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslation();
  const router = useRouter();

  const navItems = [
    { href: '/', icon: Home, label: t('discovery') },
    { href: '/profile', icon: Users, label: t('profile') },
    { href: '/profile/account_settings', icon: Settings, label: t('account_settings') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <HandCoins className="h-6 w-6 text-gray-800" />
              <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:inline">
                SpanishOffers.com
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Suspense fallback={<div className="h-9" />}>
              <UserMenu />
            </Suspense>
            {user && (
              <Button
                className="menu-button -mr-3 cursor-pointer"
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Sidebar - Right side */}
        {user && (
          <>
            <aside
              className={`sidebar fixed inset-y-0 right-0 w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
              } lg:relative lg:transform-none lg:w-64 lg:border-l lg:z-auto lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] ${
                !isSidebarOpen ? 'lg:hidden' : ''
              }`}
            >
              <nav className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} passHref>
                      <Button
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        className={`cursor-pointer w-full justify-start mt-1 ${
                          pathname === item.href ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <button 
                    className='cursor-pointer w-full p-2 flex flex-row items-center justify-start rounded-md hover:bg-gray-100 text-red-600 transition-colors'
                    onClick={async () => {
                      mutate('/api/user', null, false),
                      await signOut();
                      router.push('/');
                      router.refresh();
                      setIsSidebarOpen(false);
                    }}
                  >
                    <LogOutIcon className='h-4 w-4 mr-3' />
                    {t('sign_out')}
                  </button>
                </div>
              </nav>
            </aside>

            {/* Overlay - Only for mobile */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}