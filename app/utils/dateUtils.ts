export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDateForDB = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/** 엑셀 시리얼(일 단위) → Date (SheetJS/Excel 1900 시스템) */
const excelSerialToDate = (serial: number): Date => {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(ms);
};

/** 엑셀/문자열 입실·퇴실일 → YYYYMMDD */
export const toYmdForDB = (value: unknown): string => {
  if (value == null || value === '') return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateForDB(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // 이미 YYYYMMDD 형태 숫자
    if (value >= 19000101 && value <= 29991231 && Number.isInteger(value)) {
      return String(value);
    }
    // 엑셀 날짜 시리얼 (예: 46006)
    if (value > 20000 && value < 100000) {
      return formatDateForDB(excelSerialToDate(value));
    }
  }

  const s = String(value).trim();
  if (/^\d{8}$/.test(s)) return s;

  const iso = s.match(/^(\d{4})[-\/.년\s]+(\d{1,2})[-\/.월\s]+(\d{1,2})/);
  if (iso) {
    return `${iso[1]}${iso[2].padStart(2, '0')}${iso[3].padStart(2, '0')}`;
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(s)) {
    return formatDateForDB(parsed);
  }

  const digits = s.replace(/\D/g, '');
  return digits.length === 8 ? digits : '';
};

/** 엑셀/문자열 입실·퇴실시간 → HHMM */
export const toHhmmForDB = (value: unknown): string => {
  if (value == null || value === '') return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, '0')}${String(value.getMinutes()).padStart(2, '0')}`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // 이미 HHMM 숫자 (0~2359)
    if (Number.isInteger(value) && value >= 0 && value <= 2359) {
      return String(value).padStart(4, '0');
    }
    // 엑셀 시간 시리얼 (0~1) 또는 날짜+시간
    const fraction = value % 1;
    const totalMinutes = Math.round(fraction * 24 * 60) % (24 * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, '0')}${String(mm).padStart(2, '0')}`;
  }

  const s = String(value).trim();
  if (/^\d{4}$/.test(s)) return s;

  const hm = s.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (hm) {
    return `${hm[1].padStart(2, '0')}${hm[2]}`;
  }

  const digits = s.replace(/\D/g, '');
  if (digits.length === 3 || digits.length === 4) {
    return digits.padStart(4, '0');
  }
  return '';
}; 