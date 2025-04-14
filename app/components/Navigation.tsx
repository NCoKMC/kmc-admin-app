'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';


export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, userEmail } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 초기 체크
    checkIfMobile();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkIfMobile);
    
    // 클린업
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
                className="text-gray-700 p-2"
                aria-label="메뉴 열기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`block px-4 py-3 text-base ${
                          pathname === item.path
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/settings"
                      className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      설정 (준비중)
                    </Link>
                    <Link
                      href="/logout"
                      className="block px-4 py-3 text-base text-red-600 hover:bg-red-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그아웃
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4">
              <span className="text-xl font-bold text-gray-800">KMC 관리자</span>
            </div>
          </div>
          
          {/* 사용자 이메일 표시 */}
          {isAuthenticated && userEmail && (
            <div className="flex items-center">
              <span className="text-gray-700 font-medium text-base md:text-lg">{userEmail}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 