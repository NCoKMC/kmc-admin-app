'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// 방 상태 타입 정의
type RoomStatus = '사용중' | '퇴실' | '청소중' | '청소완료' | '셋팅완료' | '점검완료';

// 방 데이터 타입 정의
interface Room {
  id: number;
  roomNumber: string;
  status: RoomStatus;
  guestName: string;
  guestCount: number;
}

// 상태별 색상 매핑
const statusColors: Record<RoomStatus, string> = {
  '사용중': 'bg-blue-100 text-blue-800',
  '퇴실': 'bg-gray-100 text-gray-800',
  '청소중': 'bg-yellow-100 text-yellow-800',
  '청소완료': 'bg-green-100 text-green-800',
  '셋팅완료': 'bg-purple-100 text-purple-800',
  '점검완료': 'bg-indigo-100 text-indigo-800',
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
      const { data, error } = await supabase
        .from('kmc_info')
        .select('*')
        .order('roomNumber', { ascending: true });

      if (error) {
        console.error('데이터 가져오기 오류:', error);
        return;
      }

      // 데이터 형식 변환
      const formattedRooms = data.map(room => ({
        id: room.id,
        roomNumber: room.room_number,
        status: room.status,
        guestName: room.guest_name || '-',
        guestCount: room.guest_count || 0
      }));

      setRooms(formattedRooms);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = selectedStatus === '전체' 
    ? rooms 
    : rooms.filter(room => room.status === selectedStatus);

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
                    {status}
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
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/rooms/${room.roomNumber}`)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.roomNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[room.status]}`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.guestName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.guestCount}
                        </td>
                      </tr>
                    ))}
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