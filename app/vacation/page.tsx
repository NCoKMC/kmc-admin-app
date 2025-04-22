'use client';
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';

interface VacationRequest {
  id: number;
  req_email: string;
  req_date: string;
  req_cd: string;
  req_desc: string;
  res_email: string | null;
  res_date: string | null;
  res_cd: string | null;
  res_desc: string | null;
}

export default function VacationPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isMorning, setIsMorning] = useState(true);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 휴가신청 목록 조회
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('kmc_requests')
        .select('*')
        .eq('req_cd', 'VC')
        .order('req_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('데이터 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 휴가신청 처리
  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('휴가 시작일과 종료일을 선택해주세요.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('종료일은 시작일보다 이후여야 합니다.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('kmc_requests')
        .insert([
          {
            req_date: new Date().toISOString().split('T')[0],
            req_cd: 'VC',
            req_desc: memo,
            req_email: user.email,
            res_cd: 'W'
          }
        ]);

      if (error) throw error;

      setSuccess('휴가신청이 완료되었습니다.');
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('휴가신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 승인 상태 텍스트 변환
  const getStatusText = (code: string | null) => {
    switch (code) {
      case 'S': return '승인';
      case 'C': return '반려';
      case 'W': return '대기중';
      default: return '-';
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-4 sm:py-5 md:py-6 lg:py-8">
        <div className="bg-white rounded-3xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">휴가신청 현황</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              휴가신청
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">신청자</th>
                    <th className="px-4 py-2 text-left">신청일</th>
                    <th className="px-4 py-2 text-left">신청 메모</th>
                    <th className="px-4 py-2 text-left">승인자</th>
                    <th className="px-4 py-2 text-left">승인일</th>
                    <th className="px-4 py-2 text-left">승인 상태</th>
                    <th className="px-4 py-2 text-left">승인자 메모</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2">{request.req_email}</td>
                      <td className="px-4 py-2">{request.req_date}</td>
                      <td className="px-4 py-2">{request.req_desc}</td>
                      <td className="px-4 py-2">{request.res_email || '-'}</td>
                      <td className="px-4 py-2">{request.res_date || '-'}</td>
                      <td className="px-4 py-2">{getStatusText(request.res_cd)}</td>
                      <td className="px-4 py-2">{request.res_desc || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 휴가신청 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">휴가신청</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  휴가 시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  휴가 종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(e) => setIsHalfDay(e.target.checked)}
                    className="mr-2"
                  />
                  반차
                </label>
                {isHalfDay && (
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={isMorning}
                        onChange={() => setIsMorning(true)}
                        className="mr-2"
                      />
                      오전
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!isMorning}
                        onChange={() => setIsMorning(false)}
                        className="mr-2"
                      />
                      오후
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                />
                <p className="text-sm text-gray-500 text-right">
                  {memo.length}/500
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? '처리중...' : '신청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 