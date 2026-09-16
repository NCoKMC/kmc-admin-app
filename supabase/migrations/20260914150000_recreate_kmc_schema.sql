-- ============================================================
-- KMC Admin App schema (rebuilt from application source)
-- Tables: kmc_adms, kmc_info, kms_info_tmp, kmc_rooms,
--         kmc_meal_mgmt, kmc_requests, kmc_pto_mgmt,
--         kmc_guentae_mgmt, kmc_status_history
-- RPCs:   kmc_upload_info, proc_upload_info
-- ============================================================

-- ---------- kmc_adms (관리자) ----------
CREATE TABLE IF NOT EXISTS public.kmc_adms (
  email       TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  adm_yn      CHAR(1) NOT NULL DEFAULT 'N',   -- Y: 로그인 가능
  adm_grade   VARCHAR(10) NOT NULL DEFAULT '0',
  upload_yn   CHAR(1) NOT NULL DEFAULT 'N',   -- Y: 엑셀 업로드 권한
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ
);

COMMENT ON TABLE public.kmc_adms IS '관리자/스태프 계정';

-- ---------- kmc_info (예약 메인) ----------
CREATE TABLE IF NOT EXISTS public.kmc_info (
  seq_no                      INTEGER NOT NULL,
  kmc_cd                      VARCHAR(10) NOT NULL,
  user_nm                     TEXT,
  spouse_nm                   TEXT,
  dispatch_agency_nm          TEXT,
  dispatch_dmn_nm             TEXT,
  dispatch_church_nm          TEXT,
  location_nm                 TEXT,
  dispatch_agency_phone_1_num TEXT,
  user_email                  TEXT,
  check_in_ymd                VARCHAR(8),
  check_in_hhmm               VARCHAR(4),
  check_out_ymd               VARCHAR(8),
  check_out_hhmm              VARCHAR(4),
  guest_num                   INTEGER DEFAULT 1,
  group_desc                  TEXT,
  phone_num                   TEXT,
  hc                          TEXT,
  ot                          TEXT,
  proof_doc_yn                CHAR(1),
  room_no                     TEXT,
  status_cd                   CHAR(1) NOT NULL DEFAULT 'S', -- S예약 I입실 O퇴실
  status_nm                   TEXT,
  memo                        TEXT,
  reg_date                    TIMESTAMPTZ,
  reg_id                      TEXT,
  upd_date                    TIMESTAMPTZ,
  upd_id                      TEXT,
  PRIMARY KEY (kmc_cd, seq_no)
);

CREATE INDEX IF NOT EXISTS idx_kmc_info_check_in_ymd ON public.kmc_info (check_in_ymd);
CREATE INDEX IF NOT EXISTS idx_kmc_info_check_out_ymd ON public.kmc_info (check_out_ymd);
CREATE INDEX IF NOT EXISTS idx_kmc_info_status_cd ON public.kmc_info (status_cd);
CREATE INDEX IF NOT EXISTS idx_kmc_info_room_no ON public.kmc_info (room_no);

COMMENT ON TABLE public.kmc_info IS '예약 정보 메인';

-- ---------- kms_info_tmp (엑셀 업로드 임시) ----------
-- 앱 코드에서 테이블명이 kms_info_tmp 로 사용됨
CREATE TABLE IF NOT EXISTS public.kms_info_tmp (
  seq_no                      TEXT,
  kmc_cd                      TEXT,
  user_nm                     TEXT,
  spouse_nm                   TEXT,
  dispatch_agency_nm          TEXT,
  dispatch_dmn_nm             TEXT,
  dispatch_church_nm          TEXT,
  location_nm                 TEXT,
  dispatch_agency_phone_1_num TEXT,
  user_email                  TEXT,
  check_in_ymd                TEXT,
  check_in_hhmm               TEXT,
  check_out_ymd               TEXT,
  check_out_hhmm              TEXT,
  guest_num                   TEXT,
  group_desc                  TEXT,
  phone_num                   TEXT,
  hc                          TEXT,
  ot                          TEXT,
  proof_doc_yn                TEXT,
  room_no                     TEXT,
  status_cd                   TEXT,
  status_nm                   TEXT
);

COMMENT ON TABLE public.kms_info_tmp IS '엑셀 업로드 임시 테이블';

-- ---------- kmc_rooms (객실) ----------
CREATE TABLE IF NOT EXISTS public.kmc_rooms (
  org_cd         VARCHAR(10) NOT NULL DEFAULT 'K',
  room_no        VARCHAR(10) NOT NULL,
  status_cd      CHAR(1) NOT NULL DEFAULT 'Z', -- Z청소중 C청소완료 T셋팅 G점검 E수리 N
  clear_chk_yn   CHAR(1) NOT NULL DEFAULT 'N',
  bipum_chk_yn   CHAR(1) NOT NULL DEFAULT 'N',
  insp_chk_yn    CHAR(1) NOT NULL DEFAULT 'N',
  repair_chk_yn  CHAR(1) NOT NULL DEFAULT 'N',
  use_yn         CHAR(1) NOT NULL DEFAULT 'Y',
  upd_eeno       TEXT,
  upd_date       TEXT,
  PRIMARY KEY (org_cd, room_no)
);

CREATE INDEX IF NOT EXISTS idx_kmc_rooms_status_cd ON public.kmc_rooms (status_cd);
CREATE INDEX IF NOT EXISTS idx_kmc_rooms_use_yn ON public.kmc_rooms (use_yn);

COMMENT ON TABLE public.kmc_rooms IS '객실 상태 관리';

-- ---------- kmc_meal_mgmt (식사) ----------
CREATE TABLE IF NOT EXISTS public.kmc_meal_mgmt (
  room_no    VARCHAR(10) NOT NULL,
  org        VARCHAR(10) NOT NULL DEFAULT 'K',
  meal_ymd   VARCHAR(8) NOT NULL,
  meal_cd    CHAR(1) NOT NULL, -- M아침 A점심 E저녁 T기타
  meal_time  VARCHAR(4) NOT NULL,
  eat_num    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (room_no, org, meal_ymd, meal_cd)
);

CREATE INDEX IF NOT EXISTS idx_kmc_meal_mgmt_meal_ymd ON public.kmc_meal_mgmt (meal_ymd);

COMMENT ON TABLE public.kmc_meal_mgmt IS '식사 체크 기록';

-- ---------- kmc_requests (신청/승인) ----------
CREATE TABLE IF NOT EXISTS public.kmc_requests (
  req_no     BIGSERIAL PRIMARY KEY,
  req_email  TEXT NOT NULL,
  req_date   TEXT,
  req_cd     VARCHAR(10) NOT NULL, -- VC: 휴가
  req_desc   TEXT,
  res_email  TEXT,
  res_date   TEXT,
  res_cd     CHAR(1) DEFAULT 'W', -- W대기 S승인 C반려
  res_desc   TEXT
);

CREATE INDEX IF NOT EXISTS idx_kmc_requests_req_cd ON public.kmc_requests (req_cd);

COMMENT ON TABLE public.kmc_requests IS '휴가 등 신청/승인';

-- ---------- kmc_pto_mgmt (휴가 기간 요약) ----------
CREATE TABLE IF NOT EXISTS public.kmc_pto_mgmt (
  req_no     BIGINT PRIMARY KEY REFERENCES public.kmc_requests (req_no) ON DELETE CASCADE,
  req_email  TEXT,
  start_ymd  TEXT NOT NULL,
  end_ymd    TEXT NOT NULL,
  pto_cd     VARCHAR(4) NOT NULL DEFAULT 'AL' -- AL전일 MO오전반차 AF오후반차
);

COMMENT ON TABLE public.kmc_pto_mgmt IS '휴가 신청 기간 요약';

-- ---------- kmc_guentae_mgmt (일자별 근태/휴가) ----------
CREATE TABLE IF NOT EXISTS public.kmc_guentae_mgmt (
  email      TEXT NOT NULL,
  seq        INTEGER NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL,
  status_cd  VARCHAR(10) NOT NULL DEFAULT 'VC',
  req_no     BIGINT REFERENCES public.kmc_requests (req_no) ON DELETE CASCADE,
  pto_cd     VARCHAR(4),
  PRIMARY KEY (email, start_date, seq)
);

CREATE INDEX IF NOT EXISTS idx_kmc_guentae_mgmt_req_no ON public.kmc_guentae_mgmt (req_no);
CREATE INDEX IF NOT EXISTS idx_kmc_guentae_mgmt_email_status ON public.kmc_guentae_mgmt (email, status_cd);

COMMENT ON TABLE public.kmc_guentae_mgmt IS '일자별 근태/휴가';

-- ---------- kmc_status_history ----------
CREATE TABLE IF NOT EXISTS public.kmc_status_history (
  id             BIGSERIAL PRIMARY KEY,
  kmc_cd         VARCHAR(10) NOT NULL,
  seq_no         INTEGER NOT NULL,
  prev_status_cd VARCHAR(1) NOT NULL,
  new_status_cd  VARCHAR(1) NOT NULL,
  changed_by     VARCHAR(255) NOT NULL,
  changed_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kmc_cd, seq_no) REFERENCES public.kmc_info (kmc_cd, seq_no)
);

CREATE INDEX IF NOT EXISTS idx_kmc_status_history_kmc_cd_seq_no
  ON public.kmc_status_history (kmc_cd, seq_no);

-- ---------- helper: 엑셀 상태 → status_cd ----------
CREATE OR REPLACE FUNCTION public.kmc_to_status_cd(p_val TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE trim(coalesce(p_val, ''))
    WHEN '예약완료' THEN 'S'
    WHEN '접수완료' THEN 'S'
    WHEN '예약' THEN 'S'
    WHEN '입실' THEN 'I'
    WHEN '퇴실' THEN 'O'
    WHEN '예약취소' THEN 'C'
    WHEN '만실안내' THEN 'F'
    WHEN 'S' THEN 'S'
    WHEN 's' THEN 'S'
    WHEN 'I' THEN 'I'
    WHEN 'i' THEN 'I'
    WHEN 'O' THEN 'O'
    WHEN 'o' THEN 'O'
    WHEN 'C' THEN 'C'
    WHEN 'c' THEN 'C'
    WHEN 'F' THEN 'F'
    WHEN 'f' THEN 'F'
    ELSE 'S'
  END;
$$;

-- ---------- helper: 엑셀 상태/코드 → status_nm ----------
CREATE OR REPLACE FUNCTION public.kmc_to_status_nm(p_val TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE trim(coalesce(p_val, ''))
    WHEN '예약완료' THEN '예약완료'
    WHEN '접수완료' THEN '접수완료'
    WHEN '예약' THEN '예약'
    WHEN '입실' THEN '입실'
    WHEN '퇴실' THEN '퇴실'
    WHEN '예약취소' THEN '예약취소'
    WHEN '만실안내' THEN '만실안내'
    WHEN 'S' THEN '예약'
    WHEN 's' THEN '예약'
    WHEN 'I' THEN '입실'
    WHEN 'i' THEN '입실'
    WHEN 'O' THEN '퇴실'
    WHEN 'o' THEN '퇴실'
    WHEN 'C' THEN '예약취소'
    WHEN 'c' THEN '예약취소'
    WHEN 'F' THEN '만실안내'
    WHEN 'f' THEN '만실안내'
    ELSE coalesce(nullif(trim(p_val), ''), '예약')
  END;
$$;

-- ---------- helper: status_cd -> status_nm ----------
CREATE OR REPLACE FUNCTION public.kmc_status_nm(p_cd TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.kmc_to_status_nm(p_cd);
$$;

-- ---------- helper: 엑셀/문자 날짜 → YYYYMMDD ----------
CREATE OR REPLACE FUNCTION public.kmc_to_ymd(p_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v TEXT := trim(coalesce(p_val, ''));
  m TEXT[];
BEGIN
  IF v = '' THEN
    RETURN NULL;
  END IF;

  -- 이미 YYYYMMDD
  IF v ~ '^\d{8}$' THEN
    RETURN v;
  END IF;

  -- 2026-11-10 / 2026/11/10 / 2026.11.10
  m := regexp_match(v, '^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})');
  IF m IS NOT NULL THEN
    RETURN m[1] || lpad(m[2], 2, '0') || lpad(m[3], 2, '0');
  END IF;

  -- 숫자만 추출 (8자리일 때만 인정 — 4자리 시간값 오인 방지)
  v := regexp_replace(v, '[^0-9]', '', 'g');
  IF length(v) = 8 THEN
    RETURN v;
  END IF;

  RETURN NULL;
END;
$$;

-- ---------- helper: 엑셀/문자 시간 → HHMM ----------
CREATE OR REPLACE FUNCTION public.kmc_to_hhmm(p_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v TEXT := trim(coalesce(p_val, ''));
  m TEXT[];
BEGIN
  IF v = '' THEN
    RETURN NULL;
  END IF;

  IF v ~ '^\d{4}$' THEN
    RETURN v;
  END IF;

  -- 14:00 / 9:30
  m := regexp_match(v, '^(\d{1,2})\s*:\s*(\d{2})');
  IF m IS NOT NULL THEN
    RETURN lpad(m[1], 2, '0') || m[2];
  END IF;

  v := regexp_replace(v, '[^0-9]', '', 'g');
  IF length(v) IN (3, 4) THEN
    RETURN lpad(v, 4, '0');
  END IF;

  RETURN NULL;
END;
$$;

-- ---------- RPC: 엑셀 업로드 권한 체크 ----------
-- 앱: data == 'X' 이면 권한 없음
CREATE OR REPLACE FUNCTION public.kmc_upload_info(p_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_upload CHAR(1);
BEGIN
  SELECT upload_yn
    INTO v_upload
    FROM public.kmc_adms
   WHERE email = p_user_id
     AND adm_yn = 'Y';

  IF NOT FOUND THEN
    RETURN 'X';
  END IF;

  IF coalesce(v_upload, 'N') = 'Y' THEN
    RETURN 'O';
  END IF;

  RETURN 'X';
END;
$$;

-- ---------- RPC: 임시테이블 -> kmc_info 적재 ----------
CREATE OR REPLACE FUNCTION public.proc_upload_info(p_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_cnt INTEGER := 0;
BEGIN
  -- 기존 키 업데이트
  UPDATE public.kmc_info i
  SET
    user_nm = nullif(t.user_nm, ''),
    spouse_nm = nullif(t.spouse_nm, ''),
    dispatch_agency_nm = nullif(t.dispatch_agency_nm, ''),
    dispatch_dmn_nm = nullif(t.dispatch_dmn_nm, ''),
    dispatch_church_nm = nullif(t.dispatch_church_nm, ''),
    location_nm = nullif(t.location_nm, ''),
    dispatch_agency_phone_1_num = nullif(t.dispatch_agency_phone_1_num, ''),
    user_email = nullif(t.user_email, ''),
    check_in_ymd = public.kmc_to_ymd(t.check_in_ymd),
    check_in_hhmm = public.kmc_to_hhmm(t.check_in_hhmm),
    check_out_ymd = public.kmc_to_ymd(t.check_out_ymd),
    check_out_hhmm = public.kmc_to_hhmm(t.check_out_hhmm),
    guest_num = NULLIF(regexp_replace(coalesce(t.guest_num, ''), '[^0-9]', '', 'g'), '')::INTEGER,
    group_desc = nullif(t.group_desc, ''),
    phone_num = nullif(t.phone_num, ''),
    hc = nullif(t.hc, ''),
    ot = nullif(t.ot, ''),
    proof_doc_yn = left(nullif(t.proof_doc_yn, ''), 1),
    room_no = nullif(t.room_no, ''),
    status_cd = public.kmc_to_status_cd(t.status_cd),
    status_nm = coalesce(nullif(trim(t.status_nm), ''), public.kmc_to_status_nm(t.status_cd)),
    upd_date = v_now,
    upd_id = coalesce(p_user_id, 'SYSTEM')
  FROM public.kms_info_tmp t
  WHERE i.kmc_cd = nullif(t.kmc_cd, '')
    AND i.seq_no = NULLIF(regexp_replace(coalesce(t.seq_no, ''), '[^0-9]', '', 'g'), '')::INTEGER;

  GET DIAGNOSTICS v_cnt = ROW_COUNT;

  -- 신규 삽입
  INSERT INTO public.kmc_info (
    seq_no, kmc_cd, user_nm, spouse_nm, dispatch_agency_nm, dispatch_dmn_nm,
    dispatch_church_nm, location_nm, dispatch_agency_phone_1_num, user_email,
    check_in_ymd, check_in_hhmm, check_out_ymd, check_out_hhmm, guest_num,
    group_desc, phone_num, hc, ot, proof_doc_yn, room_no, status_cd, status_nm,
    memo, reg_date, reg_id, upd_date, upd_id
  )
  SELECT
    NULLIF(regexp_replace(coalesce(t.seq_no, ''), '[^0-9]', '', 'g'), '')::INTEGER,
    nullif(t.kmc_cd, ''),
    nullif(t.user_nm, ''),
    nullif(t.spouse_nm, ''),
    nullif(t.dispatch_agency_nm, ''),
    nullif(t.dispatch_dmn_nm, ''),
    nullif(t.dispatch_church_nm, ''),
    nullif(t.location_nm, ''),
    nullif(t.dispatch_agency_phone_1_num, ''),
    nullif(t.user_email, ''),
    public.kmc_to_ymd(t.check_in_ymd),
    public.kmc_to_hhmm(t.check_in_hhmm),
    public.kmc_to_ymd(t.check_out_ymd),
    public.kmc_to_hhmm(t.check_out_hhmm),
    COALESCE(NULLIF(regexp_replace(coalesce(t.guest_num, ''), '[^0-9]', '', 'g'), '')::INTEGER, 1),
    nullif(t.group_desc, ''),
    nullif(t.phone_num, ''),
    nullif(t.hc, ''),
    nullif(t.ot, ''),
    left(nullif(t.proof_doc_yn, ''), 1),
    nullif(t.room_no, ''),
    public.kmc_to_status_cd(t.status_cd),
    coalesce(nullif(trim(t.status_nm), ''), public.kmc_to_status_nm(t.status_cd)),
    NULL,
    v_now,
    coalesce(p_user_id, 'SYSTEM'),
    v_now,
    coalesce(p_user_id, 'SYSTEM')
  FROM public.kms_info_tmp t
  WHERE nullif(t.kmc_cd, '') IS NOT NULL
    AND NULLIF(regexp_replace(coalesce(t.seq_no, ''), '[^0-9]', '', 'g'), '') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.kmc_info i
      WHERE i.kmc_cd = nullif(t.kmc_cd, '')
        AND i.seq_no = NULLIF(regexp_replace(coalesce(t.seq_no, ''), '[^0-9]', '', 'g'), '')::INTEGER
    );

  -- 임시 테이블 비우기 (WHERE 필수: safeupdate / PostgREST 정책 대응)
  DELETE FROM public.kms_info_tmp WHERE true;

  RETURN 'OK:' || v_cnt::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.kmc_upload_info(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_upload_info(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.kmc_status_nm(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.kmc_to_status_cd(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.kmc_to_status_nm(TEXT) TO anon, authenticated, service_role;

-- ---------- RLS ----------
ALTER TABLE public.kmc_adms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kms_info_tmp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_meal_mgmt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_pto_mgmt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_guentae_mgmt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmc_status_history ENABLE ROW LEVEL SECURITY;

-- 관리자 앱: authenticated 전체 CRUD (운영 정책에 맞게 추후 강화)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'kmc_adms', 'kmc_info', 'kms_info_tmp', 'kmc_rooms', 'kmc_meal_mgmt',
    'kmc_requests', 'kmc_pto_mgmt', 'kmc_guentae_mgmt', 'kmc_status_history'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "kmc_authenticated_all" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "kmc_authenticated_all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- 회원가입 직후 kmc_adms insert 를 위해 anon INSERT 허용
DROP POLICY IF EXISTS "kmc_adms_anon_insert" ON public.kmc_adms;
CREATE POLICY "kmc_adms_anon_insert" ON public.kmc_adms
  FOR INSERT TO anon
  WITH CHECK (true);

-- ---------- 객실 시드 (필요 시 수정) ----------
INSERT INTO public.kmc_rooms (org_cd, room_no, status_cd, use_yn)
SELECT 'K', r.room_no, 'G', 'Y'
FROM (VALUES
  ('101'),('102'),('103'),('104'),('105'),('106'),
  ('107'),('108'),('109'),('110'),('111'),('112'),
  ('201'),('202'),('203'),('204'),('205'),('206'),
  ('207'),('208'),('209'),('210'),('211'),('212'),
  ('301'),('302'),('303'),('304'),('305'),('306'),
  ('307'),('308'),('309'),('310'),('311'),('312')
) AS r(room_no)
ON CONFLICT (org_cd, room_no) DO NOTHING;
