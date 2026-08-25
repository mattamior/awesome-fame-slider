import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_VOTES, PEOPLE } from './data';
import './styles.css';

type VoteSummary = { counts: number[]; total: number; leader: number };

function mode(counts: number[]) {
  let best = 0;
  for (let i = 1; i < counts.length; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

export default function App() {
  const params = new URLSearchParams(location.search);
  const initialId = params.get('who') || 'liang';
  const [personId, setPersonId] = useState(PEOPLE.some((p) => p.id === initialId) ? initialId : 'liang');
  const person = PEOPLE.find((p) => p.id === personId)!;
  const [rank, setRank] = useState(Number(params.get('rank') || 2));
  const [summary, setSummary] = useState<VoteSummary>(() => {
    const counts = DEFAULT_VOTES[person.id];
    return { counts, total: counts.reduce((a, b) => a + b, 0), leader: mode(counts) };
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('who', person.id);
    url.searchParams.set('rank', String(rank));
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
  }, [person.id]);

  const current = person.ranks[summary.leader] || person.ranks[2];
  const selected = person.ranks[rank] || person.ranks[2];
  const shareText = useMemo(
    () => `My vote for ${person.name}: ${selected.zh} (${selected.en})`,
    [person, selected],
  );

  async function shareAndVote() {
    setBusy(true);
    try {
      const res = await fetch('/api/x/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ personId: person.id, rank }),
      });
      if (res.status === 401) {
        location.href = `/api/auth/x/start?person=${encodeURIComponent(person.id)}&rank=${rank}`;
        return;
      }
      if (!res.ok) throw new Error('share failed');
      const data = await res.json();
      if (data.postUrl) location.href = data.postUrl;
    } catch {
      const url = new URL('https://x.com/intent/tweet');
      url.searchParams.set('text', `${shareText}\n\n${location.href}`);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
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

        <div className="selected-card">
          <span>YOUR VERDICT</span><strong>{selected.zh}</strong><em>{selected.en}</em>
        </div>

        <button className="share" onClick={shareAndVote} disabled={busy}>{busy ? 'Opening X…' : 'Share to X & cast vote'}</button>
        <p className="fine">A vote is only counted after an authenticated X post succeeds. If X auth is not configured yet, this falls back to the normal share composer and does not count a vote.</p>
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