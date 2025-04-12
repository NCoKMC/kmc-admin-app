'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';

interface MealInfo {
  id: number;
  room_no: string;
  org: string;
  meal_date: string;
  meal_cd: string;
  eat_num: number;
}

export default function MealListPage() {
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchRoomNo, setSearchRoomNo] = useState<string>('');
  const [mealList, setMealList] = useState<MealInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSearchDate(formattedDate);
  }, []);

  // 식사 정보 조회 함수
  const handleSearch = async () => {
    if (!searchDate) {
      setError('날짜를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
      const formattedDate = searchDate.replace(/-/g, '');
      
      // 쿼리 조건 설정
      let query = supabase
        .from('kmc_meal_mgmt')
        .select('*')
        .eq('meal_date', formattedDate);
      
      // 방번호가 입력된 경우 방번호 조건 추가
      if (searchRoomNo) {
        query = query.eq('room_no', searchRoomNo);
      }
      
      // 쿼리 실행
      const { data, error } = await query.order('meal_date', { ascending: false });

      if (error) {
        console.error('Error fetching meal data:', error);
        setError(`데이터 조회 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        return;
      }

      if (!data || data.length === 0) {
        setSuccess('조회된 식사 정보가 없습니다.');
        setMealList([]);
        return;
      }

      setMealList(data);
      setSuccess(`${data.length}건의 식사 정보가 조회되었습니다.`);
    } catch (err) {
      console.error('Exception details:', err);
      setError(`오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 형식 변환 함수 (YYYYMMDD -> YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (dateString.length !== 8) return dateString;
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
  };

  // 시간 형식 변환 함수 (HHMM -> HH:MM)
  const formatTime = (timeString: string) => {
    if (timeString.length !== 4) return timeString;
    return `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`;
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">식사 확인 목록</h1>
          
          {/* 검색 조건 영역 */}
          <div className="mb-6 bg-blue-50 p-4 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">검색 조건</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700 mb-1">
                  날짜
                </label>
                <input
                  type="date"
                  id="searchDate"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="searchRoomNo" className="block text-sm font-medium text-gray-700 mb-1">
                  방번호 (선택)
                </label>
                <input
                  type="text"
                  id="searchRoomNo"
                  value={searchRoomNo}
                  onChange={(e) => setSearchRoomNo(e.target.value)}
                  placeholder="방번호 입력"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {loading ? '조회 중...' : '조회'}
            </button>
          </div>
          
          {/* 메시지 표시 영역 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          {/* 결과 표시 영역 */}
          {mealList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">방번호</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">식사 날짜</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">식사 코드</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">식사 인원</th>                   
                  </tr>
                </thead>
                <tbody>
                  {mealList.map((meal) => (
                    <tr key={meal.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">{meal.room_no}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(meal.meal_date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{meal.meal_cd}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{meal.eat_num}명</td>                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 