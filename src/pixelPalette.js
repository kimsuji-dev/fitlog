// 모든 픽셀 스프라이트(Critters, MuscleMap)가 공유하는 색상 팔레트.
// 광원은 좌상단 고정 — 각 재질은 base(기본) / shadow(그림자) / highlight(하이라이트)
// 3톤을 기본으로 하고, 윤곽선은 순검정 대신 톤을 낮춘 다크 바이올렛을 쓴다.
export const PALETTE = {
  // 윤곽선
  outline: '#3a3350',

  // 피부
  skin: '#f4c9a8',
  skinShadow: '#dba888',
  skinHighlight: '#fbe0c4',

  // 눈 / 볼터치
  eye: '#3d3355',
  blush: '#f2a0ad',

  // 아내 — 긴 다크 바이올렛 머리
  hairWife: '#4a3f6b',
  hairWifeHighlight: '#786c9e',

  // 남편 — 짧은 다크 머리
  hairHusband: '#382f52',
  hairHusbandHighlight: '#655a86',

  // 아내 상의 — 블러쉬 핑크
  topWife: '#e08bb3',
  topWifeHighlight: '#f7bdd7',

  // 남편 상의 — 민트 틸
  topHusband: '#7db8ac',
  topHusbandHighlight: '#aad9cd',

  // 하의 / 신발 — 뮤트 바이올렛 그레이
  pants: '#8175ab',
  pantsShadow: '#5f5488',
  shoe: '#4a3f6b',

  // 아기천사 — 골드 후광
  halo: '#f0c96e',
  haloHighlight: '#f7d488',

  // 아기천사 — 날개 / 가운 (크림빛 화이트)
  wing: '#fdf8f4',
  gown: '#ded6f2',
  gownHighlight: '#f4f0fb',
  gownShadow: '#bcb2dc',

  // 근육맵 — 비활성(중립) 톤
  neutral: '#d6d0e8',
  neutralShadow: '#bcb4d8',
  neutralHighlight: '#e9e5f4',

  // 근육맵 — 활성(강조) 바이올렛 톤
  hilite: '#7c6cf0',
  hiliteShadow: '#5d4dd1',
  hiliteHighlight: '#a79cf7',
}
