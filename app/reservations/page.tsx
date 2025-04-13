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
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [reservations, setReservations] = useState<KmcInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 예약 상태 옵션
  const reservationStatusOptions = [
    { value: '전체', label: '전체' },
    { value: 'I', label: '입실' },
    { value: 'S', label: '예약' },
    { value: 'O', label: '퇴실' }
  ];

  // 데이터 가져오기 함수
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedYearMonth.split('-');
      const formattedDate = `${selectedYearMonth.replace(/-/g, '')}%`;
      const endDate = `${selectedYearMonth}-31`;

      
    
      let query = supabase
        .from('kmc_info')
        .select('*')        
        .or(`check_in_ymd.like.${formattedDate},check_out_ymd.like.${formattedDate}`)
        .in('status_cd', ['S', 'I', 'O'])
        .order('check_in_ymd', { ascending: true });

      

      if (selectedStatus !== '전체') {
        query = query.eq('status_cd', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건이 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchReservations();
  }, [selectedYearMonth, selectedStatus]);

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* 검색 조건 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">검색 조건</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 년월 선택 */}
              <div>
                <label htmlFor="yearMonth" className="block text-sm font-medium text-gray-700 mb-1">
                  년월
                </label>
                <input
                  type="month"
                  id="yearMonth"
                  value={selectedYearMonth}
                  onChange={(e) => setSelectedYearMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 예약 상태 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 상태
                </label>
                <div className="flex flex-wrap gap-2">
                  {reservationStatusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        selectedStatus === option.value 
                          ? option.value === '전체' ? 'bg-blue-500 text-white' :
                            option.value === 'S' ? 'bg-green-100 text-green-800' :
                            option.value === 'I' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                            reservation.status_cd === 'S' ? 'bg-green-100 text-green-800' : 
                            reservation.status_cd === 'I' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reservationStatusMap[reservation.status_cd as ReservationStatus]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" >
                          {reservation.user_nm}
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