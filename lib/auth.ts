import { supabase } from './supabase';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 인증 상태를 확인하는 함수
export async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.log('인증 확인 중 오류 발생:', error);
    // 로그인되지 않은 경우 로그인 페이지로 리디렉션
    redirect('/login');
  }
  console.log('인증 확인 완료:', session);
  return session;
}

// 클라이언트 컴포넌트에서 사용할 수 있는 인증 확인 훅
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (!session) {
          router.push('/login');
        }
      } catch (error) {
        console.error('인증 확인 중 오류 발생:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // 인증 상태 변경 이벤트 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  
  return { isAuthenticated, loading };
} 