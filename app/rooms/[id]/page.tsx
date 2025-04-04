'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Navigation from '../../components/Navigation';

// 방 상태 타입 정의
type RoomStatus = '사용중' | '퇴실' | '청소중' | '청소완료' | '셋팅완료' | '점검완료';

// 방 인터페이스 정의
interface Room {
  id: string;
  number: number;
  status: RoomStatus;
  userName: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  phone: string;
  notes: string;
}

// 샘플 데이터
const roomData: Room = {
  id: '1',
  number: 101,
  status: '사용중',
  userName: '김철수',
  guestCount: 2,
  checkIn: '2024-04-01 14:00',
  checkOut: '2024-04-02 12:00',
  phone: '010-1234-5678',
  notes: '특별 요청사항 없음'
};

// 상태별 색상 매핑
const statusColors: Record<RoomStatus, string> = {
  '사용중': 'bg-red-100 text-red-800',
  '퇴실': 'bg-yellow-100 text-yellow-800',
  '청소중': 'bg-blue-100 text-blue-800',
  '청소완료': 'bg-green-100 text-green-800',
  '셋팅완료': 'bg-purple-100 text-purple-800',
  '점검완료': 'bg-indigo-100 text-indigo-800',
};

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.id as string;

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{roomData.number}호 상세 정보</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[roomData.status]}`}>
              {roomData.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">방 번호</span>
                  <span className="font-medium">{roomData.number}호</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상태</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${statusColors[roomData.status]}`}>
                    {roomData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 이용자 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">이용자 정보</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">이름</span>
                  <span className="font-medium">{roomData.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연락처</span>
                  <span className="font-medium">{roomData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">인원</span>
                  <span className="font-medium">{roomData.guestCount}명</span>
                </div>
              </div>
            </div>

            {/* 체크인/아웃 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">체크인/아웃 정보</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">체크인</span>
                  <span className="font-medium">{roomData.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">체크아웃</span>
                  <span className="font-medium">{roomData.checkOut}</span>
                </div>
              </div>
            </div>

            {/* 특이사항 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">특이사항</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{roomData.notes}</p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-8 flex justify-end space-x-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              수정
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              삭제
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 