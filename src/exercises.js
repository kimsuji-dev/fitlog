// MET: 근력(머신/바벨/덤벨/케이블)=5, 맨몸=4, 스트레칭=2.5,
// 유산소: 걷기3.5 러닝8 사이클7 로잉7 스텝밀9 일립티컬5 줄넘기10
export const MUSCLES = ['가슴', '등', '어깨', '이두', '삼두', '복근', '둔근', '대퇴사두', '햄스트링', '종아리', '전신']
export const EQUIPMENT = ['머신', '바벨', '덤벨', '케이블', '맨몸', '유산소', '스트레칭']

export const BUILTIN = [
  // ── 기존 20종 (이름/타입 유지) ──
  { name: '벤치프레스', met: 5, type: 'weight', muscles: ['가슴', '삼두'], equipment: '바벨' },
  { name: '스쿼트', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '바벨' },
  { name: '데드리프트', met: 6, type: 'weight', muscles: ['등', '햄스트링'], equipment: '바벨' },
  { name: '숄더프레스', met: 5, type: 'weight', muscles: ['어깨'], equipment: '덤벨' },
  { name: '랫풀다운', met: 4, type: 'weight', muscles: ['등', '이두'], equipment: '머신' },
  { name: '바벨로우', met: 5, type: 'weight', muscles: ['등'], equipment: '바벨' },
  { name: '레그프레스', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '머신' },
  { name: '레그컬', met: 4, type: 'weight', muscles: ['햄스트링'], equipment: '머신' },
  { name: '레그익스텐션', met: 4, type: 'weight', muscles: ['대퇴사두'], equipment: '머신' },
  { name: '덤벨컬', met: 4, type: 'weight', muscles: ['이두'], equipment: '덤벨' },
  { name: '트라이셉스 익스텐션', met: 4, type: 'weight', muscles: ['삼두'], equipment: '덤벨' },
  { name: '크런치', met: 4, type: 'weight', muscles: ['복근'], equipment: '맨몸' },
  { name: '플랭크', met: 3, type: 'weight', muscles: ['복근'], equipment: '맨몸' },
  { name: '런지', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '맨몸' },
  { name: '힙쓰러스트', met: 5, type: 'weight', muscles: ['둔근'], equipment: '바벨' },
  { name: '러닝', met: 8, type: 'cardio', muscles: ['전신'], equipment: '유산소' },
  { name: '걷기', met: 3.5, type: 'cardio', muscles: ['전신'], equipment: '유산소' },
  { name: '사이클', met: 7, type: 'cardio', muscles: ['대퇴사두', '종아리'], equipment: '유산소' },
  { name: '로잉머신', met: 7, type: 'cardio', muscles: ['등', '전신'], equipment: '유산소' },
  { name: '스텝밀', met: 9, type: 'cardio', muscles: ['대퇴사두', '둔근'], equipment: '유산소' },

  // ── 가슴 ──
  { name: '체스트프레스', met: 5, type: 'weight', muscles: ['가슴', '삼두'], equipment: '머신' },
  { name: '인클라인 벤치프레스', met: 5, type: 'weight', muscles: ['가슴', '어깨'], equipment: '바벨' },
  { name: '딥스', met: 4, type: 'weight', muscles: ['가슴', '삼두'], equipment: '맨몸' },
  { name: '케이블 플라이', met: 5, type: 'weight', muscles: ['가슴'], equipment: '케이블' },
  { name: '펙덱 플라이', met: 5, type: 'weight', muscles: ['가슴'], equipment: '머신' },
  { name: '푸시업', met: 4, type: 'weight', muscles: ['가슴', '삼두'], equipment: '맨몸' },

  // ── 등 ──
  { name: 'V-bar 랫 풀 다운', met: 5, type: 'weight', muscles: ['등', '이두'], equipment: '머신' },
  { name: '시티드 로우', met: 5, type: 'weight', muscles: ['등'], equipment: '케이블' },
  { name: '풀업', met: 4, type: 'weight', muscles: ['등', '이두'], equipment: '맨몸' },
  { name: '백 익스텐션', met: 4, type: 'weight', muscles: ['등', '둔근'], equipment: '맨몸' },
  { name: '원암 덤벨로우', met: 5, type: 'weight', muscles: ['등'], equipment: '덤벨' },

  // ── 어깨 ──
  { name: '사이드 레터럴 레이즈', met: 5, type: 'weight', muscles: ['어깨'], equipment: '덤벨' },
  { name: '리어 델트 플라이', met: 5, type: 'weight', muscles: ['어깨', '등'], equipment: '덤벨' },
  { name: '아놀드 프레스', met: 5, type: 'weight', muscles: ['어깨'], equipment: '덤벨' },
  { name: '프론트 레이즈', met: 5, type: 'weight', muscles: ['어깨'], equipment: '덤벨' },
  { name: '업라이트 로우', met: 5, type: 'weight', muscles: ['어깨'], equipment: '바벨' },

  // ── 팔 (이두/삼두) ──
  { name: '해머컬', met: 4, type: 'weight', muscles: ['이두'], equipment: '덤벨' },
  { name: '케이블 푸시다운', met: 5, type: 'weight', muscles: ['삼두'], equipment: '케이블' },
  { name: '프리쳐컬', met: 5, type: 'weight', muscles: ['이두'], equipment: '머신' },
  { name: '바벨컬', met: 5, type: 'weight', muscles: ['이두'], equipment: '바벨' },
  { name: '킥백', met: 4, type: 'weight', muscles: ['삼두'], equipment: '덤벨' },

  // ── 복근 ──
  { name: '레그레이즈', met: 4, type: 'weight', muscles: ['복근'], equipment: '맨몸' },
  { name: '러시안 트위스트', met: 4, type: 'weight', muscles: ['복근'], equipment: '맨몸' },
  { name: '케이블 크런치', met: 5, type: 'weight', muscles: ['복근'], equipment: '케이블' },
  { name: '행잉 레그레이즈', met: 4, type: 'weight', muscles: ['복근'], equipment: '맨몸' },
  { name: '싯업', met: 4, type: 'weight', muscles: ['복근'], equipment: '맨몸' },

  // ── 하체 (대퇴사두/햄스트링/둔근/종아리) ──
  { name: '스미스 스쿼트', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '머신' },
  { name: '불가리안 스플릿 스쿼트', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '덤벨' },
  { name: '카프레이즈', met: 4, type: 'weight', muscles: ['종아리'], equipment: '맨몸' },
  { name: '루마니안 데드리프트', met: 5, type: 'weight', muscles: ['햄스트링', '둔근'], equipment: '바벨' },
  { name: '힙 어덕션(이너 싸이 머신)', met: 5, type: 'weight', muscles: ['대퇴사두'], equipment: '머신' },
  { name: '힙 어브덕션(아웃 싸이 머신)', met: 5, type: 'weight', muscles: ['둔근'], equipment: '머신' },
  { name: '시티드 카프레이즈', met: 5, type: 'weight', muscles: ['종아리'], equipment: '머신' },
  { name: '스탠딩 카프레이즈', met: 5, type: 'weight', muscles: ['종아리'], equipment: '머신' },
  { name: '글루트 킥백', met: 4, type: 'weight', muscles: ['둔근'], equipment: '맨몸' },
  { name: '스모 스쿼트', met: 5, type: 'weight', muscles: ['대퇴사두', '둔근'], equipment: '덤벨' },

  // ── 스트레칭 ──
  { name: '덤벨 사이드 밴드', met: 2.5, type: 'weight', muscles: ['복근'], equipment: '스트레칭' },
  { name: '사이드 스트레칭', met: 2.5, type: 'weight', muscles: ['전신'], equipment: '스트레칭' },
  { name: '햄스트링 스트레칭', met: 2.5, type: 'weight', muscles: ['햄스트링'], equipment: '스트레칭' },
  { name: '고양이 자세 스트레칭', met: 2.5, type: 'weight', muscles: ['등'], equipment: '스트레칭' },
  { name: '폼롤러 이완', met: 2.5, type: 'weight', muscles: ['전신'], equipment: '스트레칭' },

  // ── 유산소 추가 ──
  { name: '트레드밀 러닝', met: 8, type: 'cardio', muscles: ['전신'], equipment: '유산소' },
  { name: '일립티컬', met: 5, type: 'cardio', muscles: ['전신'], equipment: '유산소' },
  { name: '줄넘기', met: 10, type: 'cardio', muscles: ['종아리', '전신'], equipment: '유산소' },
  { name: '이너/아웃 싸이(유산소)', met: 5, type: 'cardio', muscles: ['대퇴사두'], equipment: '유산소' },
  { name: '실내자전거', met: 7, type: 'cardio', muscles: ['대퇴사두', '종아리'], equipment: '유산소' },
]
