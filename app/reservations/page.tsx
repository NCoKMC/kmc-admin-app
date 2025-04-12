'use client';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, isToday } from 'date-fns';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import Router from 'next/router';
import { supabase } from '../lib/supabase';
import type { JSX } from 'react';
import { KmcInfo, ReservationStatus, reservationStatusMap } from '../lib/type';

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
  // email: string;
  // memo: string;
//}

export default function Reservations() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState<KmcInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  // type RoomStatus = 'I' | 'O' | 'S';
  // // 상태 코드 매핑
  // const statusMap: Record<RoomStatus, string> = {
  //   'I': '입실',
  //   'O': '퇴실', 
  //   'S': '예약'    
  // };


  // 데이터 가져오기 함수
  const fetchReservations = async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = format(date, 'yyyyMMdd');
    
    

      const { data, error } = await supabase
        .from('kmc_info')
        .select('*')
        .or(`check_in_ymd.eq.${formattedDate},check_out_ymd.eq.${formattedDate}`)
        .in('status_cd', ['S', 'I','O'])
        .order('check_in_ymd', { ascending: true });

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchReservations(selectedDate);
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

          {/* 예약 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">예약 목록</h2>
            </div>
            {loading ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크인</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크아웃</th>                                                           
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation, index) => (
                      <tr key={`${reservation.kmc_cd}-${index}`} className={`hover:bg-gray-50 font-medium cursor-pointer ${
                        isToday(new Date(reservation.check_out_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))) 
                          ? 'bg-yellow-100'
                          : 'bg-green-50'
                      }`} onClick={() => router.push(`/reservation-detail/${reservation.kmc_cd}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            reservation.status_cd === 'S' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            
                            {reservationStatusMap[reservation.status_cd as ReservationStatus]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" >
                          {reservation.user_nm}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.phone_num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                        </td>                       
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.location_nm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.check_in_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_in_hhmm}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isToday(new Date(reservation.check_out_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))) 
                            ? 'text-pink-500 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          {reservation.check_out_ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')} {reservation.check_out_hhmm}
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