'use client';
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '@/lib/supabase';

interface VisitorInfo {
  user_nm: string;
  guest_num: number;
  kmc_cd: string;
}

export default function MealCheckPage() {
  const [roomNumber, setRoomNumber] = useState('');
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');

  const handleButtonClick = (num: string) => {
    if (roomNumber.length < 3) {
      setRoomNumber(prev => prev + num);
    }
  };

  const handleClear = () => {
    setRoomNumber('');
    setVisitorInfo(null);
    setMealCount(0);
    setError('');
    setWarning('');
    setSuccess('');
  };

  const handleMealCountChange = (change: number) => {
    const newCount = mealCount + change;
    
    if (newCount < 0) {
      setMealCount(0);
      return;
    }
    
    if (visitorInfo && newCount > visitorInfo.guest_num) {
      setWarning(`경고: 전체 인원수(${visitorInfo.guest_num}명)보다 많은 식사 인원을 입력했습니다.`);
    } else {
      setWarning('');
    }
    
    setMealCount(newCount);
  };

  const handleCheck = async () => {
    if (roomNumber.length !== 3) {
      setError('방번호를 3자리로 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setWarning('');
      setSuccess('');
      
      const { data, error } = await supabase
        .from('kmc_info')
        .select('user_nm, guest_num, kmc_cd')
        .gte('check_in_ymd', new Date().toISOString().split('T')[0].replace(/-/g, ''))
        .like('room_no', `%${roomNumber}%`)
        .in('status_cd', ['I','S'])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('해당 방번호에 입실 중인 방문자가 없습니다.');
        } else {
          setError('데이터를 가져오는 중 오류가 발생했습니다.');
          console.error('Error fetching data:', error);
        }
        setVisitorInfo(null);
        return;
      }

      setVisitorInfo(data);
      setMealCount(0); // 방문자 정보가 로드되면 식사 인원 초기화
    } catch (err) {
      setError('오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!visitorInfo) {
      setError('방문자 정보가 없습니다.');
      return;
    }

    if (mealCount <= 0) {
      setError('식사 인원을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setWarning('');
      setSuccess('');

      // 현재 날짜와 시간 가져오기
      const now = new Date();
      const today = now.toISOString().split('T')[0].replace(/-/g, '');
      const currentTime = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);

      // 저장할 데이터 준비
      const mealData = {
        room_no: roomNumber,
        org: 'K',
        meal_date: today,
        meal_cd: 'M',
        eat_num: mealCount
      };

      console.log('저장할 데이터:', mealData);

      // 식사 정보 저장 - kmc_meal_mgmt 테이블에 저장
      const { data, error } = await supabase
        .from('kmc_meal_mgmt')
        .insert(mealData)
        .select();

      if (error) {
        console.error('Error details:', error);
        if (error.message.includes('Failed to fetch')) {
          setError('인터넷 연결이 끊어졌습니다. 연결을 확인하고 다시 시도해 주세요.');
        } else {
          setError(`식사 정보 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        }
        return;
      }

      console.log('저장된 데이터:', data);
      setSuccess(`식사 인원 ${mealCount}명이 성공적으로 등록되었습니다.`);
      
      // 식사 인원 초기화
      setMealCount(0);

      // 팝업 닫기
      setVisitorInfo(null);

      // roomNumber 초기화
      setRoomNumber('');
    } catch (err) {
      console.error('Exception details:', err);
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('인터넷 연결이 끊어졌습니다. 연결을 확인하고 다시 시도해 주세요.');
      } else {
        setError(`오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">식사 확인</h1>
          
          {/* 방번호 입력 영역 */}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-700 mb-2">방번호를 입력하세요</h2>
            <div className="text-8xl font-bold text-center mb-16 h-12">
              {roomNumber || '---'}
            </div>
            
            {/* 숫자 버튼 그룹 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleButtonClick(num.toString())}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-6xl font-bold py-12 rounded-xl transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleButtonClick('0')}
                className="bg-blue-500 hover:bg-blue-600 text-white text-6xl font-bold py-12 rounded-xl transition-colors"
              >
                0
              </button>
              <button
                onClick={handleClear}
                className="bg-red-500 hover:bg-red-600 text-white text-6xl font-bold py-12 rounded-xl transition-colors"
              >
                C
              </button>
            </div>
            
            {/* 확인 버튼 */}
            <button
              onClick={handleCheck}
              disabled={loading || roomNumber.length !== 3}
              className={`w-full py-12 rounded-xl text-white font-bold text-5xl ${
                loading || roomNumber.length !== 3
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } transition-colors`}
            >
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
          
          {/* 결과 표시 영역 */}
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
          
          {visitorInfo && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-lg max-w-[72rem] w-full relative">
                {/* 돌아가기 버튼 */}
                <button 
                  onClick={() => {
                    setVisitorInfo(null);
                    setRoomNumber('');
                  }} 
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-colors"
                  aria-label="돌아가기"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  돌아가기
                </button>
                
                <h2 className="text-xl font-bold text-gray-800 mb-4">방문자 정보</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600">방번호</p>
                    <p className="text-2xl font-bold">{roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">방문자</p>
                    <p className="text-2xl font-bold">{visitorInfo.user_nm}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">인원수</p>
                    <p className="text-2xl font-bold">{visitorInfo.guest_num}명</p>
                  </div>
                </div>
                
                {/* 식사 인원 입력 영역 */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">식사 인원 입력</h3>
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <button
                      onClick={() => handleMealCountChange(-1)}
                      className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <div className="text-3xl font-bold w-16 text-center">{mealCount}</div>
                    <button
                      onClick={() => handleMealCountChange(1)}
                      className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-center text-gray-600">전체 인원: {visitorInfo.guest_num}명</p>
                  
                  {warning && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mt-4">
                      {warning}
                    </div>
                  )}
                  
                  {/* 신청 버튼 */}
                  <button
                    onClick={handleSubmit}
                    disabled={saving || mealCount <= 0}
                    className={`w-full mt-4 py-3 rounded-xl text-white font-bold text-lg ${
                      saving || mealCount <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600'
                    } transition-colors`}
                  >
                    {saving ? '저장 중...' : '식사 신청'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 