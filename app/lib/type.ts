// 타입 정의
export interface KmcInfo {
    kmc_cd: string;
    user_nm: string;
    location_nm: string;
    check_in_ymd: string;
    check_out_ymd: string;
    room_no: string;
    guest_num: number;
    status_cd: string;
    status_nm: string;
    group_desc: string;
    check_in_hhmm: string;
    check_out_hhmm: string;
    phone_num: string;
    user_email: string;
    seq_no: string;
    memo: string;
  };

  export type ReservationStatus = 'I' | 'O' | 'S' | 'C' | 'F';
  // 상태 코드 매핑
  export const reservationStatusMap: Record<ReservationStatus, string> = {
    'I': '입실',
    'O': '퇴실', 
    'S': '예약',
    'C': '예약취소',
    'F': '만실안내',
  };

  /** 엑셀 상태(한글/코드) → status_cd, status_nm */
  export function mapExcelReservationStatus(raw: unknown): { status_cd: ReservationStatus; status_nm: string } {
    const s = String(raw ?? '').trim();
    switch (s) {
      case '예약완료':
        return { status_cd: 'S', status_nm: '예약완료' };
      case '접수완료':
        return { status_cd: 'S', status_nm: '접수완료' };
      case '예약':
        return { status_cd: 'S', status_nm: '예약' };
      case '입실':
      case 'I':
      case 'i':
        return { status_cd: 'I', status_nm: '입실' };
      case '퇴실':
      case 'O':
      case 'o':
        return { status_cd: 'O', status_nm: '퇴실' };
      case '예약취소':
      case 'C':
      case 'c':
        return { status_cd: 'C', status_nm: '예약취소' };
      case '만실안내':
      case 'F':
      case 'f':
        return { status_cd: 'F', status_nm: '만실안내' };
      case 'S':
      case 's':
        return { status_cd: 'S', status_nm: '예약' };
      default:
        // 알 수 없는 값은 예약(S)로 두고 원문은 status_nm 에 보존
        return { status_cd: 'S', status_nm: s || '예약' };
    }
  } 

// 방 데이터 타입 정의
export interface Room {
    org_cd: string;
    room_no: string;
    status_cd: string;
    clear_chk_yn: string;
    bipum_chk_yn: string;
    insp_chk_yn: string;
    use_yn: string;
    check_in_ymd?: string;
    check_out_ymd?: string;
  };

  // 방 상태 타입 정의
export type RoomStatus =  'Z' | 'C' | 'T' | 'G' | 'E';

// 상태 코드 매핑
export const roomStatusMap: Record<RoomStatus, string> = {  
  'Z': '청소중',
  'C': '청소완료',
  'T': '셋팅완료',
  'G': '점검완료',
  'E': '수리중'
};

// 상태별 색상 매핑
export const roomStatusColors: Record<RoomStatus, string> = {
    'Z': 'bg-yellow-100 text-yellow-800',
    'C': 'bg-green-100 text-green-800',
    'T': 'bg-purple-100 text-purple-800',
    'G': 'bg-indigo-100 text-indigo-800',
    'E': 'bg-red-100 text-red-800'
  };





  