# lottofinde-data

로또핀더 앱이 실행 중 읽어가는 **공개 데이터 전용** 저장소입니다.
(앱 소스코드·분석 알고리즘은 별도 비공개 저장소에서 관리됩니다.)

## 구조
- `data/enriched/{회차}.json` — 회차별 당첨번호·판매정보
- `data/enriched/index.json` — 전체 회차 인덱스
- `data/jachanism/pool_{회차}.json` — 주간 조합 풀
- `data/jachanism/backtest.json` — 최근 1년 백테스트 결과
- `data/jachanism/index.json` — 풀 인덱스

매주 자동 갱신됩니다. 이 저장소에는 어떤 알고리즘/소스코드도 포함되지 않습니다.
