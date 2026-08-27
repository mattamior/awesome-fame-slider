import { useCallback, useEffect, useMemo, useState } from 'react';
import { EMPTY_VOTES, PEOPLE, type Person } from './data';
import './styles.css';

type VoteSummary = { counts: number[]; total: number; leader: number };

const NEUTRAL_RANK = 2;

function emptySummary(personId: string): VoteSummary {
  const counts = EMPTY_VOTES[personId] || [0, 0, 0, 0, 0, 0];
  return { counts, total: 0, leader: NEUTRAL_RANK };
}

function Avatar({ person, className, labelled = false }: { person: Person; className: string; labelled?: boolean }) {
  return (
    <span
      className={`${className} avatar-shell`}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? `${person.name} stylized portrait` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <span className="avatar-fallback">{person.accent}</span>
      <span
        className="avatar-image"
        style={{ backgroundPosition: `${person.avatarIndex / (PEOPLE.length - 1) * 100}% 0` }}
      />
    </span>
  );
}

export default function App() {
  const params = new URLSearchParams(location.search);
  const initialId = params.get('who') || 'liang';
  const [personId, setPersonId] = useState(PEOPLE.some((p) => p.id === initialId) ? initialId : 'liang');
  const person = PEOPLE.find((p) => p.id === personId)!;
  const initialRank = Number(params.get('rank') || NEUTRAL_RANK);
  const [rank, setRank] = useState(Number.isInteger(initialRank) && initialRank >= 0 && initialRank <= 5 ? initialRank : NEUTRAL_RANK);
  const [summary, setSummary] = useState<VoteSummary>(() => emptySummary(personId));
  const [liveResults, setLiveResults] = useState(false);
  const [voting, setVoting] = useState(false);
  const [notice, setNotice] = useState(() => params.get('from') === 'share' ? 'You opened a shared verdict. Slide it and cast your own vote.' : '');

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('who', person.id);
    url.searchParams.set('rank', String(rank));
    url.searchParams.delete('from');
    history.replaceState(null, '', url);
  }, [person.id, rank]);

  const refreshSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/people/${person.id}`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('vote API unavailable');
      const data = await response.json() as VoteSummary;
      if (!Array.isArray(data.counts) || data.counts.length !== 6) throw new Error('invalid vote payload');
      setSummary({ counts: data.counts.map(Number), total: Number(data.total) || 0, leader: Number(data.leader) });
      setLiveResults(true);
    } catch {
      setSummary(emptySummary(person.id));
      setLiveResults(false);
    }
  }, [person.id]);

  useEffect(() => {
    void refreshSummary();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshSummary();
    }, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshSummary();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshSummary, notice]);

  const current = person.ranks[summary.leader] || person.ranks[NEUTRAL_RANK];
  const selected = person.ranks[rank] || person.ranks[NEUTRAL_RANK];
  const shareText = useMemo(() => `My vote for ${person.name}: ${selected.zh} (${selected.en}). What's your verdict?`, [person, selected]);

  async function castVote() {
    setVoting(true);
    setNotice('');
    try {
      const response = await fetch(`/api/people/${person.id}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ rank }),
      });
      const data = await response.json().catch(() => ({})) as Partial<VoteSummary> & { error?: string };

      if (response.status === 429) {
        setNotice('Too many vote changes from this network. Try again in about 10 minutes.');
        return;
      }
      if (!response.ok || !Array.isArray(data.counts) || data.counts.length !== 6) {
        throw new Error(data.error || 'vote failed');
      }

      setSummary({
        counts: data.counts.map(Number),
        total: Number(data.total) || 0,
        leader: Number(data.leader),
      });
      setLiveResults(true);
      setNotice(`Vote saved: ${selected.zh}. Sharing to X is optional and does not affect your vote.`);
    } catch {
      setNotice('Could not save your vote. Nothing was changed.');
    } finally {
      setVoting(false);
    }
  }

  function shareToX() {
    const shareUrl = `${location.origin}/share/${encodeURIComponent(person.id)}/${rank}`;
    const intent = new URL('https://x.com/intent/tweet');
    intent.searchParams.set('text', shareText);
    intent.searchParams.set('url', shareUrl);
    window.open(intent.toString(), '_blank', 'noopener,noreferrer');
    setNotice('X composer opened. Your site vote is independent of whether you publish the post.');
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">REPUTATION RHEOSTAT</p>
          <h1>Slide Rheostat</h1>
          <p className="dek">Pick a person. Slide their status. Cast your vote. Share the verdict.</p>
        </div>
        <a className="github" href="https://github.com/mattamior/awesome-fame-slider" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <nav className="people" aria-label="People">
        {PEOPLE.map((p) => (
          <button key={p.id} disabled={voting} className={p.id === person.id ? 'active' : ''} onClick={() => { setPersonId(p.id); setRank(NEUTRAL_RANK); }}>
            <Avatar person={p} className="mini-avatar" /><span>{p.nameZh}</span>
          </button>
        ))}
      </nav>

      <section className="instrument">
        <div className="plate-top">
          <div className="subject">
            <Avatar person={person} className="subject-avatar" labelled />
            <div className="subject-copy">
              <span className="label">SUBJECT</span>
              <strong>{person.nameZh}</strong>
              <small>{person.name} · {person.role}</small>
            </div>
          </div>
          <div className="community"><span className="label">COMMUNITY NOW</span><strong>{current.zh}</strong><small>{liveResults ? `${summary.total} anonymous vote${summary.total === 1 ? '' : 's'}` : 'live results unavailable'}</small></div>
        </div>

        <div className="track-wrap">
          <div className="coil" />
          <input disabled={voting} aria-label="Reputation rank" type="range" min="0" max="5" step="1" value={rank} onChange={(e) => setRank(Number(e.target.value))} />
          <div className="thumb-face" style={{ left: `calc(${rank / 5 * 100}% - 33px)` }}>
            <Avatar person={person} className="thumb-avatar" />
          </div>
        </div>

        <div className="rank-labels">
          {person.ranks.map((r, i) => <button disabled={voting} key={r.id} className={i === rank ? 'chosen' : ''} onClick={() => setRank(i)}>{r.zh}</button>)}
        </div>

        <div className="selected-card"><span>YOUR VERDICT</span><strong>{selected.zh}</strong><em>{selected.en}</em></div>
        <div className="actions">
          <button className="vote" onClick={castVote} disabled={voting}>{voting ? 'Saving vote…' : 'Cast vote'}</button>
          <button className="share" onClick={shareToX}>Share to X</button>
        </div>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="fine">Voting happens on this site, not through the X API. One anonymous browser device keeps one active vote per person; voting again updates it. Network rate limits discourage rapid repeat submissions. X sharing uses a free Web Intent and never changes the vote.</p>
      </section>

      <section className="results" aria-live="polite">
        <div className="results-heading">
          <h2>Current vote distribution</h2>
          <span className={liveResults ? 'live-dot live' : 'live-dot'}>{liveResults ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <div className="bars">
          {person.ranks.map((r, i) => {
            const pct = summary.total ? Math.round((summary.counts[i] / summary.total) * 100) : 0;
            return <div className="bar-row" key={r.id}><span>{r.zh}</span><div className="bar"><i style={{ width: `${pct}%` }} /></div><b>{pct}%</b></div>;
          })}
        </div>
        {!liveResults && <p className="results-note">Live voting data could not be loaded. No sample votes are shown.</p>}
      </section>

      <footer>Parody / internet sentiment toy. Stylized portraits are illustrative and not official likenesses. Not affiliated with the people or companies shown.</footer>
    </main>
  );
}
