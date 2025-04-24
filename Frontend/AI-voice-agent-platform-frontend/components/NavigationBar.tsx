'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Grid, Mic, FileText, RefreshCw } from 'lucide-react';

interface NavigationBarProps {
  // Additional props can be added here if needed
}

export function NavigationBar({}: NavigationBarProps) {
  const pathname = usePathname();
  
  // Define navigation items
  const navItems = [
    {
      name: 'Back to dashboard',
      href: '/',
      icon: Grid,
      active: false // This is always inactive since it's a "back" button
    },
    {
      name: 'Change voice',
      href: '/choose-voice',
      icon: Mic,
      active: pathname === '/choose-voice'
    },
    {
      name: 'Manage files',
      href: '/load-files',
      icon: FileText,
      active: pathname === '/load-files'
    },
    {
      name: 'Test and refine',
      href: '/test-and-refine-overview',
      icon: RefreshCw,
      active: pathname === '/test-and-refine-overview' || 
              pathname === '/test-and-refine-with-alice'
    }
  ];
  
  return (
    <div className="flex items-center gap-4">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`flex items-center gap-2 text-sm ${
            item.active 
              ? 'text-green-500 font-medium' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Link>
      ))}
    </div>
  );
}