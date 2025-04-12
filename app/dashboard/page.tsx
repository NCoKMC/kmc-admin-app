'use client';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import Router from 'next/router';
import { supabase } from '@/lib/supabase';

// 타입 정의
interface KmcInfo {
  kmc_cd: string;
  user_nm: string;
  location_nm: string;
  check_in_ymd: string;
  check_out_ymd: string;
  room_no: string;
  guest_num: number;
  status_cd: string;
  status_nm: string;
  group_desc: string;
  check_in_hhmm: string;
  check_out_hhmm: string;
}
type RoomStatus = 'I' | 'O' | 'S';
  // 상태 코드 매핑
  const statusMap: Record<RoomStatus, string> = {
    'I': '입실',
    'O': '퇴실', 
    'S': '예약'    
  };
export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [incomingFriends, setIncomingFriends] = useState<KmcInfo[]>([]);
  const [outgoingFriends, setOutgoingFriends] = useState<KmcInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">날짜 선택</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 오늘 오는 친구 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">오늘 오는 친구</h2>
            </div>
            {loading ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">친구이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">지역명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">오는 시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">방정보</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">가족수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomingFriends.map((friend, index) => (
                      <tr key={`${friend.kmc_cd}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer truncate" onClick={() => router.push(`/reservation-detail/${friend.kmc_cd}`)}>{friend.user_nm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.location_nm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.check_in_hhmm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.room_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.guest_num}명</td>
                        <td className="px-6 py-4 whitespace-nowrap truncate">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            friend.status_cd === 'S' ? 'bg-green-100 text-green-800' 
                            : friend.status_cd === 'I' ? 'bg-green-100 text-green-800' 
                              :'bg-yellow-100 text-yellow-800'
                          }`}>                            
                            {statusMap[friend.status_cd as RoomStatus]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 오늘 가는 친구 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 가는 친구</h2>
            {loading ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">친구이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">지역명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">가는 시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">방정보</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">가족수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outgoingFriends.map((friend, index) => (
                      <tr key={`${friend.kmc_cd}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate" onClick={() => router.push(`/reservation-detail/${friend.kmc_cd}`)}>{friend.user_nm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.location_nm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.check_out_hhmm}  </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.room_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">{friend.guest_num}명</td>
                        <td className="px-6 py-4 whitespace-nowrap truncate">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            friend.status_cd === 'I' ? 'bg-pink-100 text-pink-800' 
                            : friend.status_cd === 'O' ? 'bg-green-100 text-green-800' 
                              :'bg-yellow-100 text-yellow-800'
                          }`}>
                            {statusMap[friend.status_cd as RoomStatus]}
                          </span>
                        </td>
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