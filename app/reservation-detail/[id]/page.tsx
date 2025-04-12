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
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* 뒤로가기 버튼 */}
          <div className="flex justify-start">
            <button
              onClick={() => router.back()}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors"
            >
              ← 뒤로가기
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center py-8">
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : reservation ? (
            <>
              {/* 예약 정보 카드 */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">예약 상세 정보</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    reservation.status_cd === 'I' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                   {reservationStatusMap[reservation.status_cd as ReservationStatus]}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">기본 정보</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">예약자</div>
                      <div className="col-span-2 font-medium">{reservation.user_nm}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">연락처</div>
                      <div className="col-span-2 font-medium">                        
                        {reservation.phone_num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                        </div>
                      
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">이메일</div>
                      <div className="col-span-2 font-medium">{reservation.user_email}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">지역</div>
                      <div className="col-span-2 font-medium">{reservation.location_nm}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">그룹</div>
                      <div className="col-span-2 font-medium">{reservation.group_desc}</div>
                    </div>
                  </div>

                  {/* 체크인/아웃 정보 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">체크인/아웃 정보</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">체크인</div>
                      <div className="col-span-2 font-medium">
                        {reservation.check_in_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_in_hhmm}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">체크아웃</div>
                      <div className="col-span-2 font-medium">
                        {reservation.check_out_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_out_hhmm}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">방번호</div>
                      <div className="col-span-2 font-medium">{reservation.room_no}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-500">인원</div>
                      <div className="col-span-2 font-medium">{reservation.guest_num}명</div>
                    </div>
                  </div>
                </div>

                {/* 메모 */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">메모</h3>
                  <p className="text-gray-700 whitespace-pre-line">{reservation.seq_no || '메모 없음'}</p>
                </div>

                {/* 상태 변경 버튼 */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => updateStatus('I')}
                    className={`px-4 py-2 rounded-lg ${
                      reservation.status_cd === 'S'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    입실
                  </button>
                  <button
                    onClick={() => updateStatus('O')}
                    className={`px-4 py-2 rounded-lg ${
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
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center py-8">
              <p className="text-gray-600">예약 정보를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 