/**
 * 당첨번호(enriched) 자동 갱신 — GitHub Actions에서 매주 실행.
 * smok95 공개 미러에서 최신 회차까지 보충한다. 알고리즘/비공개 요소 없음.
 *
 * 이 저장소 루트에서 실행: node scripts/refresh-enriched.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ENR = path.join(process.cwd(), 'data', 'enriched');

async function getJson(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); }
  catch { return null; }
}

function currentMax() {
  const nums = fs.readdirSync(ENR)
    .map((f) => Number(f.replace('.json', '')))
    .filter((n) => Number.isInteger(n));
  return Math.max(0, ...nums);
}

(async () => {
  const idxPath = path.join(ENR, 'index.json');
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  const set = new Set(idx.rounds);
  const from = currentMax() + 1;
  let added = 0;

  for (let round = from; round < from + 60; round++) {
    const res = await getJson(`https://smok95.github.io/lotto/results/${round}.json`);
    if (!res || !Array.isArray(res.numbers)) break; // 아직 미추첨 → 종료
    const stores = await getJson(`https://smok95.github.io/lotto/winning-stores/${round}.json`);
    const d = res.divisions || [];
    const enriched = {
      round,
      date: (res.date || '').slice(0, 10),
      nums: res.numbers,
      bonus: res.bonus_no,
      firstWinAmount: d[0] ? d[0].prize : null,
      firstWinners: d[0] ? d[0].winners : null,
      totalSales: res.total_sales_amount ?? null,
      prizes: {
        first: d[0] ? { amount: d[0].prize, winners: d[0].winners } : null,
        second: d[1] ? { amount: d[1].prize, winners: d[1].winners } : null,
        third: d[2] ? { amount: d[2].prize, winners: d[2].winners } : null,
        fourth: d[3] ? { amount: d[3].prize, winners: d[3].winners } : null,
        fifth: d[4] ? { amount: d[4].prize, winners: d[4].winners } : null,
      },
      methodCounts: {
        auto: res.winners_combination?.auto ?? 0,
        manual: res.winners_combination?.manual ?? 0,
        mixed: res.winners_combination?.semi_auto ?? 0,
      },
      topStores: Array.isArray(stores) ? stores.map((s) => ({
        rank: s.rank ?? 1, name: s.name, address: s.address,
        method: s.method || 'auto', lat: s.lat, lng: s.lng,
      })) : [],
    };
    fs.writeFileSync(path.join(ENR, `${round}.json`), JSON.stringify(enriched, null, 2));
    set.add(round);
    added++;
    console.log(`+ ${round}회 ${res.numbers.join(',')}+${res.bonus_no}`);
  }

  if (added > 0) {
    idx.rounds = [...set].sort((a, b) => b - a);
    idx.updatedAt = new Date().toISOString();
    fs.writeFileSync(idxPath, JSON.stringify(idx));
    console.log(`갱신 완료: +${added}회 (최신 ${idx.rounds[0]})`);
  } else {
    console.log('새 회차 없음.');
  }
})();
