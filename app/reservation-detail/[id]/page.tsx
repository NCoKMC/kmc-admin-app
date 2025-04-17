'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { supabase } from '../../lib/supabase';
import { KmcInfo, ReservationStatus, reservationStatusMap } from '../../lib/type';
// 타입 정의
//interface Reservation {
  // kmc_cd: string;
  // user_nm: string;
  // location_nm: string;
  // check_in_ymd: string;
  // check_out_ymd: string;
  // check_in_hhmm: string;
  // check_out_hhmm: string;
  // room_no: string;
  // guest_num: number;
  // status_cd: string;
  // status_nm: string;
  // group_desc: string;
  // phone_num: string;
  // user_email: string;
  // seq_no: string;
  // memo: string;
//}
//type RoomStatus = 'I' | 'O' | 'S';
  // 상태 코드 매핑
  //const statusMap: Record<RoomStatus, string> = {
  //  'I': '입실',
  //  'O': '퇴실', 
  //  'S': '예약'    
  //};

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<KmcInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState('');
  const [savingMemo, setSavingMemo] = useState(false);
  const [memoError, setMemoError] = useState('');
  const [memoSuccess, setMemoSuccess] = useState('');
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

  // 데이터 가져오기 함수
  const fetchReservation = async () => {
    try {
      setLoading(true);
      const kmc_cd = params.id as string;

      const { data, error } = await supabase
        .from('kmc_info')
        .select('*')
        .eq('kmc_cd', kmc_cd)          
        .in('status_cd', ['S', 'I','O'])
        .single();

      if (error) throw error;

      setReservation(data);
      setMemo(data.memo || '');
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  // 메모 저장 함수
  const saveMemo = async () => {
    if (!reservation) return;
    
    try {
      setSavingMemo(true);
      setMemoError('');
      setMemoSuccess('');
      
      const { error } = await supabase
        .from('kmc_info')
        .update({ memo: memo })
        .eq('kmc_cd', reservation.kmc_cd)
        .eq('seq_no', reservation.seq_no);
      
      if (error) throw error;
      
      setMemoSuccess('메모가 성공적으로 저장되었습니다.');
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setMemoSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving memo:', error);
      setMemoError('메모 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingMemo(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchReservation();
  }, [params.id]);

  // 예약 상태 업데이트 함수
  const updateStatus = async (newStatus: string) => {
    try {
      if (!reservation) {
        alert("null"); 
        return;
      }
      console.log('저장할 newStatus:', newStatus);
      console.log('저장할 데이터:', reservation);

      // 현재 로그인한 사용자의 이메일 가져오기
      // const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // if (userError) {
      //   console.error('Error getting user:', userError);
      //   alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      //   return;
      // }
      
      // if (!user || !user.email) {
      //   alert('로그인이 필요합니다.');
      //   return;
      // }
      

      const { error } = await supabase
        .from('kmc_info')
        .update({ status_cd: newStatus })
        .eq('kmc_cd', reservation.kmc_cd)
        .eq('seq_no', reservation.seq_no)
        .select();

      if (error) throw error;

      // 상태 업데이트 후 데이터 다시 가져오기
      fetchReservation();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          {/* 뒤로가기 버튼 */}
          <div className="flex justify-start">
            <button
              onClick={() => router.back()}
              className="bg-white text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              ← 뒤로가기
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg text-center py-6 sm:py-8">
              <p className="text-gray-600 text-sm sm:text-base">로딩 중...</p>
            </div>
          ) : reservation ? (
            <>
              {/* 예약 정보 카드 */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">예약 상세 정보</h2>
                    <span className={`px-4 sm:px-6 py-1 sm:py-2 rounded-full text-sm sm:text-base lg:text-lg font-bold ${
                      reservation.status_cd === 'S' ? 'bg-green-100 text-green-800' :
                          reservation.status_cd === 'I' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                     {reservationStatusMap[reservation.status_cd as ReservationStatus]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* 기본 정보 */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 border-b pb-1 sm:pb-2">기본 정보</h3>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">예약자</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">{reservation.user_nm}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">연락처</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">                        
                        {reservation.phone_num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                        </div>                      
                    </div>                    
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">지역</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">{reservation.location_nm}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">그룹</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">{reservation.group_desc}</div>
                    </div>
                  </div>

                  {/* 체크인/아웃 정보 */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 border-b pb-1 sm:pb-2">체크인/아웃 정보</h3>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">체크인</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">
                        {reservation.check_in_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_in_hhmm}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">체크아웃</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">
                        {reservation.check_out_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_out_hhmm}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">방번호</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">{reservation.room_no}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      <div className="text-gray-500 text-sm sm:text-base">인원</div>
                      <div className="col-span-2 font-medium text-sm sm:text-base">{reservation.guest_num}명</div>
                    </div>
                  </div>
                </div>

                {/* 메모 */}
                <div className="mt-4 sm:mt-6 space-y-2">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 border-b pb-1 sm:pb-2">메모</h3>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    maxLength={1000}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    rows={4}
                    placeholder="메모를 입력하세요 (최대 1000자)"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500">{memo.length}/1000</span>
                    <button
                      onClick={saveMemo}
                      disabled={savingMemo}
                      className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 text-sm sm:text-base"
                    >
                      {savingMemo ? '저장 중...' : '메모 저장'}
                    </button>
                  </div>
                  {memoError && (
                    <p className="text-red-500 text-xs sm:text-sm">{memoError}</p>
                  )}
                  {memoSuccess && (
                    <p className="text-green-500 text-xs sm:text-sm">{memoSuccess}</p>
                  )}
                </div>

                {/* 상태 변경 버튼 */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
                  <button
                    onClick={() => updateStatus('S')}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                      reservation.status_cd === 'I'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                    }`}
                  >
                    예약
                  </button>
                  <button
                    onClick={() => updateStatus('I')}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                      reservation.status_cd === 'S'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    입실
                  </button>
                  <button
                    onClick={() => updateStatus('O')}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                      reservation.status_cd === 'I'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                    }`}
                  >
                    퇴실
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg text-center py-6 sm:py-8">
              <p className="text-gray-600 text-sm sm:text-base">예약 정보를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 