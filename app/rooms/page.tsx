'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// 방 상태 타입 정의
type RoomStatus = 'I' | 'O' | 'N' | 'C' | 'T' | 'G';

// 상태 코드 매핑
const statusMap: Record<RoomStatus, string> = {
  'I': '사용중',
  'O': '퇴실',
  'N': '청소중',
  'C': '청소완료',
  'T': '셋팅완료',
  'G': '점검완료'
};

// 방 데이터 타입 정의
interface Room {
  org: string;
  room_no: string;
  status_cd: string;
  clear_chk_yn: string;
  bipum_chk_yn: string;
  set_chk_yn: string;
  check_yn: string;
}

// 상태별 색상 매핑
const statusColors: Record<RoomStatus, string> = {
  'I': 'bg-blue-100 text-blue-800',
  'O': 'bg-gray-100 text-gray-800',
  'N': 'bg-yellow-100 text-yellow-800',
  'C': 'bg-green-100 text-green-800',
  'T': 'bg-purple-100 text-purple-800',
  'G': 'bg-indigo-100 text-indigo-800'
};

export default function RoomList() {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | '전체'>('전체');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('데이터 가져오기 시작');
      
      const { data, error } = await supabase
        .from('kmc_rooms')
        .select('*')
        .order('room_no', { ascending: true });

      if (error) {
        console.error('데이터 가져오기 오류:', error);
        return;
      }

      console.log('가져온 데이터:', data);
      
      if (!data || data.length === 0) {
        console.log('데이터가 없습니다.');
        setRooms([]);
        return;
      }

      // 데이터 형식 변환
      const formattedRooms = data.map(room => ({
        room_no: room.room_no || '',
        org: room.org || '',
        status_cd: room.status_cd || 'O',
        clear_chk_yn: room.clear_chk_yn || 'N',
        bipum_chk_yn: room.bipum_chk_yn || 'N',
        set_chk_yn: room.set_chk_yn || 'N',
        check_yn: room.check_yn || 'N'
      }));

      console.log('변환된 데이터:', formattedRooms);
      setRooms(formattedRooms);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = selectedStatus === '전체' 
    ? rooms 
    : rooms.filter(room => room.status_cd === selectedStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="min-h-screen bg-[#1e3a8a] p-8">
          <div className="max-w-7xl mx-auto">
            {/* 헤더 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
              <h1 className="text-2xl font-semibold text-gray-800">방 목록</h1>
              
              {/* 상태 필터 */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('전체')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    selectedStatus === '전체' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {Object.keys(statusColors).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as RoomStatus)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      selectedStatus === status 
                        ? 'bg-blue-500 text-white' 
                        : `${statusColors[status as RoomStatus]} hover:opacity-80`
                    }`}
                  >
                    {statusMap[status as RoomStatus]}
                  </button>
                ))}
              </div>
            </div>

            {/* 방 목록 테이블 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        방번호
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        방상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이용자명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        입실인원
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room, index) => (
                        <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/rooms/${room.room_no}`)}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {room.room_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[room.status_cd as RoomStatus] || 'bg-gray-100 text-gray-800'}`}>
                              {statusMap[room.status_cd as RoomStatus] || '알 수 없음'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.org}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 