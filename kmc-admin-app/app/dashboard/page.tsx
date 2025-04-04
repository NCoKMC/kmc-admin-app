'use client';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import { useRouter } from 'next/navigation';
import Router from 'next/router';

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
  const router = useRouter();


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
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">친구이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">오는 시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">방번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가족수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomingFriends.map((friend) => (
                    <tr key={friend.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => router.push(`/room/${friend.id}`)}>{friend.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">서울</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{friend.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">101호</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4명</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          friend.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {friend.status === 'confirmed' ? '확정' : '대기중'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 오늘 가는 친구 목록 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">오늘 가는 친구</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">친구이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가는 시간</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">방번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가족수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {outgoingFriends.map((friend) => (
                    <tr key={friend.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{friend.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">서울</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{friend.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">101호</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4명</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          friend.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {friend.status === 'confirmed' ? '확정' : '대기중'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 