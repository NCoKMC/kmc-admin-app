import { supabase } from './supabase';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

// 중복 로그인 체크 및 다른 세션 로그아웃 함수
export async function checkDuplicateLogin(email: string) {
  try {
    // 현재 세션 가져오기
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession) {
      return false;
    }

    // 현재 사용자의 모든 세션 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // 현재 세션을 제외한 다른 세션 로그아웃
    const { error } = await supabase.auth.signOut({
      scope: 'others'
    });
    
    if (error) {
      console.error('다른 세션 로그아웃 중 오류 발생:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('중복 로그인 체크 중 오류 발생:', error);
    return false;
  }
}

// 클라이언트 컴포넌트에서 사용할 수 있는 인증 확인 훅
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          
          // kmc_adms 테이블에서 사용자 이름 가져오기
          const { data: userData, error: userError } = await supabase
            .from('kmc_adms')
            .select('name')
            .eq('email', session.user.email)
            .single();
          
          if (!userError && userData) {
            setUserName(userData.name);
          }
        }
        
        // 시작 페이지('/')에서는 리디렉션하지 않음
        if (!session && pathname !== '/') {
          router.push('/login');
        }
      } catch (error) {
        console.error('인증 확인 중 오류 발생:', error);
        if (pathname !== '/') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // 인증 상태 변경 이벤트 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          
          // kmc_adms 테이블에서 사용자 이름 가져오기
          const { data: userData, error: userError } = await supabase
            .from('kmc_adms')
            .select('name')
            .eq('email', session.user.email)
            .single();
          
          if (!userError && userData) {
            setUserName(userData.name);
          }
        } else {
          setUserEmail(null);
          setUserName(null);
        }
        
        if (event === 'SIGNED_OUT' && pathname !== '/') {
          router.push('/login');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);
  
  return { isAuthenticated, loading, userEmail, userName };
} 