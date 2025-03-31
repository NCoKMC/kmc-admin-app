'use client';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

// 임시 데이터
const incomingFriends = [
  { id: 1, name: "김철수", time: "09:00", status: "confirmed" },
  { id: 2, name: "이영희", time: "10:30", status: "pending" },
  { id: 3, name: "박지민", time: "14:00", status: "confirmed" },
];

const outgoingFriends = [
  { id: 1, name: "홍길동", time: "11:00", status: "confirmed" },
  { id: 2, name: "강민수", time: "15:30", status: "pending" },
  { id: 3, name: "정다인", time: "16:00", status: "confirmed" },
];

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button className="text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">대시보드</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* 날짜 선택 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">날짜 선택</h2>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 오늘 오는 친구 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 오는 친구</h2>
            <div className="space-y-4">
              {incomingFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-800">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    friend.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {friend.status === 'confirmed' ? '확정' : '대기중'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 오늘 가는 친구 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 가는 친구</h2>
            <div className="space-y-4">
              {outgoingFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-800">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    friend.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {friend.status === 'confirmed' ? '확정' : '대기중'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 