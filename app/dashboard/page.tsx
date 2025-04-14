'use client';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import Router from 'next/router';
import { supabase } from '../lib/supabase';
import { KmcInfo, ReservationStatus, reservationStatusMap } from '../lib/type';

// 타입 정의
//interface propPage {
  // kmc_cd: string;
  // user_nm: string;
  // location_nm: string;
  // check_in_ymd: string;
  // check_out_ymd: string;
  // room_no: string;
  // guest_num: number;
  // status_cd: string;
  // status_nm: string;
  // group_desc: string;
  // check_in_hhmm: string;
  // check_out_hhmm: string;

//}

// type RoomStatus = 'I' | 'O' | 'S';
//   // 상태 코드 매핑
//   const statusMap: Record<RoomStatus, string> = {
//     'I': '입실',
//     'O': '퇴실', 
//     'S': '예약'    
//   };
export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [incomingFriends, setIncomingFriends] = useState<KmcInfo[]>([]);
  const [outgoingFriends, setOutgoingFriends] = useState<KmcInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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
  const fetchKmcInfo = async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = format(date, 'yyyyMMdd');

      // 도착하는 친구들 가져오기
      const { data: incomingData, error: incomingError } = await supabase
        .from('kmc_info')
        .select('*')
        .eq('check_in_ymd', formattedDate)
        .in('status_cd', ['I', 'S'])
        .order('check_in_ymd', { ascending: true });

      if (incomingError) throw incomingError;

      // 출발하는 친구들 가져오기
      const { data: outgoingData, error: outgoingError } = await supabase
        .from('kmc_info')
        .select('*')
        .eq('check_out_ymd', formattedDate)
        .in('status_cd', ['O', 'I','S'])
        .order('check_out_ymd', { ascending: true });

      if (outgoingError) throw outgoingError;

      setIncomingFriends(incomingData || []);
      setOutgoingFriends(outgoingData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchKmcInfo(selectedDate);
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* 날짜 선택 */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-0 sm:mr-4">날짜 선택</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
            />
          </div>

          {/* 오늘 오는 친구 목록 */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">입실예정</h2>
            </div>
            {loading ? (
              <div className="text-center py-3 sm:py-4 text-sm sm:text-base">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">객실</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">오는 시간</th>                      
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">인원</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">지역</th>                      
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomingFriends.map((friend, index) => (
                      <tr key={`${friend.kmc_cd}-${index}`} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                            friend.status_cd === 'S' ? 'bg-green-100 text-green-800' 
                            : friend.status_cd === 'I' ? 'bg-green-100 text-green-800' 
                              :'bg-yellow-100 text-yellow-800'
                          }`}>                            
                            {reservationStatusMap[friend.status_cd as ReservationStatus]}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 cursor-pointer" onClick={() => router.push(`/reservation-detail/${friend.kmc_cd}`)}>{friend.user_nm}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.room_no}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.check_in_hhmm}</td>                        
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.guest_num}명</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.location_nm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 오늘 가는 친구 목록 */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">퇴실예정</h2>
            </div>
            {loading ? (
              <div className="text-center py-3 sm:py-4 text-sm sm:text-base">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">이름</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">객실</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">가는 시간</th>                      
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">인원</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">지역</th>                      
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outgoingFriends.map((friend, index) => (
                      <tr key={`${friend.kmc_cd}-${index}`} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                            friend.status_cd === 'S' ? 'bg-green-100 text-green-800' 
                            : friend.status_cd === 'I' ? 'bg-blue-100 text-blue-800' 
                              :'bg-yellow-100 text-yellow-800'
                          }`}>                            
                            {reservationStatusMap[friend.status_cd as ReservationStatus]}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 cursor-pointer" onClick={() => router.push(`/reservation-detail/${friend.kmc_cd}`)}>{friend.user_nm}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.room_no}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.check_out_hhmm}</td>                        
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.guest_num}명</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{friend.location_nm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 