import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_VOTES, PEOPLE, type Person, type Rank } from './data';
import './styles.css';

type VoteSummary = { counts: number[]; total: number; leader: number };

function mode(counts: number[]) {
  let best = 0;
  for (let i = 1; i < counts.length; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

function shareCardBase64(person: Person, selected: Rank, rank: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = '#eee3cf';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#171717';
  ctx.lineWidth = 8;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = '#171717';
  ctx.font = '700 34px ui-monospace, monospace';
  ctx.fillText('SLIDE RHEOSTAT / REPUTATION METER', 76, 105);
  ctx.font = '800 70px system-ui, sans-serif';
  ctx.fillText(person.name, 76, 205);
  ctx.font = '500 30px system-ui, sans-serif';
  ctx.fillText(person.role, 78, 252);

  ctx.strokeStyle = '#402b1f';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(95, 395);
  ctx.lineTo(1105, 395);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const x = 110 + i * 196;
    ctx.fillStyle = i === rank ? '#171717' : '#a8987c';
    ctx.beginPath();
    ctx.arc(x, 395, i === rank ? 27 : 13, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#171717';
  ctx.font = '900 78px system-ui, sans-serif';
  ctx.fillText(selected.zh, 76, 535);
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText(selected.en, 80, 580);
  ctx.textAlign = 'right';
  ctx.font = '700 28px ui-monospace, monospace';
  ctx.fillText(`RANK ${rank + 1} / 6`, 1115, 575);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png').split(',')[1];
}

export default function App() {
  const params = new URLSearchParams(location.search);
  const initialId = params.get('who') || 'liang';
  const [personId, setPersonId] = useState(PEOPLE.some((p) => p.id === initialId) ? initialId : 'liang');
  const person = PEOPLE.find((p) => p.id === personId)!;
  const initialRank = Number(params.get('rank') || 2);
  const [rank, setRank] = useState(Number.isInteger(initialRank) && initialRank >= 0 && initialRank <= 5 ? initialRank : 2);
  const [summary, setSummary] = useState<VoteSummary>(() => {
    const counts = DEFAULT_VOTES[person.id];
    return { counts, total: counts.reduce((a, b) => a + b, 0), leader: mode(counts) };
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(() => params.get('shared') === '1' ? 'Shared to X — your vote was counted.' : params.get('shareError') ? 'X sharing did not complete. No vote was counted.' : '');

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('who', person.id);
    url.searchParams.set('rank', String(rank));
    url.searchParams.delete('shared');
    url.searchParams.delete('shareError');
    history.replaceState(null, '', url);
  }, [person.id, rank]);

  useEffect(() => {
    fetch(`/api/people/${person.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setSummary(data))
      .catch(() => {
        const counts = DEFAULT_VOTES[person.id];
        setSummary({ counts, total: counts.reduce((a, b) => a + b, 0), leader: mode(counts) });
      });
  }, [person.id, notice]);

  const current = person.ranks[summary.leader] || person.ranks[2];
  const selected = person.ranks[rank] || person.ranks[2];
  const shareText = useMemo(() => `My vote for ${person.name}: ${selected.zh} (${selected.en})`, [person, selected]);

  async function shareAndVote() {
    setBusy(true);
    setNotice('');
    try {
      const mediaBase64 = shareCardBase64(person, selected, rank);
      const res = await fetch('/api/x/share/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ personId: person.id, rank, mediaBase64 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.authUrl) {
        location.href = data.authUrl;
        return;
      }
      if (res.status === 429) {
        setNotice('Too many share attempts from this network. Try again in about 10 minutes. No vote was counted.');
        return;
      }
      if (res.status === 503) {
        const url = new URL('https://x.com/intent/tweet');
        url.searchParams.set('text', `${shareText}\n\n${location.href}`);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
        setNotice('X API is not configured yet. Composer opened, but this does not count as a vote.');
        return;
      }
      throw new Error(data.error || 'share failed');
    } catch {
      setNotice('Could not start verified X sharing. No vote was counted.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">REPUTATION RHEOSTAT</p>
          <h1>Slide Rheostat</h1>
          <p className="dek">Pick a person. Slide their status. Share your verdict.</p>
        </div>
        <a className="github" href="https://github.com/mattamior/slide-rheostat" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <nav className="people" aria-label="People">
        {PEOPLE.map((p) => (
          <button key={p.id} className={p.id === person.id ? 'active' : ''} onClick={() => { setPersonId(p.id); setRank(2); }}>
            <span className="mini-avatar">{p.accent}</span><span>{p.nameZh}</span>
          </button>
        ))}
      </nav>

      <section className="instrument">
        <div className="plate-top">
          <div><span className="label">SUBJECT</span><strong>{person.nameZh}</strong><small>{person.name} · {person.role}</small></div>
          <div className="community"><span className="label">COMMUNITY NOW</span><strong>{current.zh}</strong><small>{summary.total} votes</small></div>
        </div>

        <div className="track-wrap">
          <div className="coil" />
          <input aria-label="Reputation rank" type="range" min="0" max="5" step="1" value={rank} onChange={(e) => setRank(Number(e.target.value))} />
          <div className="thumb-face" style={{ left: `calc(${rank / 5 * 100}% - 33px)` }}>{person.accent}</div>
        </div>

        <div className="rank-labels">
          {person.ranks.map((r, i) => <button key={r.id} className={i === rank ? 'chosen' : ''} onClick={() => setRank(i)}>{r.zh}</button>)}
        </div>

        <div className="selected-card"><span>YOUR VERDICT</span><strong>{selected.zh}</strong><em>{selected.en}</em></div>
        <button className="share" onClick={shareAndVote} disabled={busy}>{busy ? 'Preparing share…' : 'Share to X & cast vote'}</button>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="fine">Your vote is recorded only after X confirms that the authenticated image post was created successfully. One X account keeps one active vote per person.</p>
      </section>

      <section className="results">
        <h2>Current vote distribution</h2>
        <div className="bars">
          {person.ranks.map((r, i) => {
            const pct = summary.total ? Math.round((summary.counts[i] / summary.total) * 100) : 0;
            return <div className="bar-row" key={r.id}><span>{r.zh}</span><div className="bar"><i style={{ width: `${pct}%` }} /></div><b>{pct}%</b></div>;
          })}
        </div>
      </section>

      <footer>Parody / internet sentiment toy. Not affiliated with the people or companies shown.</footer>
    </main>
  );
}
