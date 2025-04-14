'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';


export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: '대시보드', path: '/dashboard' },
    { name: '예약 목록', path: '/reservations' },
    { name: '방 목록', path: '/room-list' },
    { name: '식사 확인', path: '/meal-check' },
    { name: '식사 확인 목록', path: '/meal-list' },
  ];

  return (
    <nav className="bg-white shadow-lg mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      설정 (준비중)
                    </Link>
                    <Link
                      href="/logout"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      로그아웃
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-lg font-bold ${
                    pathname === item.path
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>          
        </div>
      </div>
    </nav>
  );
} 