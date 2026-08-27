import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY_VOTES, PEOPLE, type Person } from './data';
import {
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  UI,
  initialLocale,
  initialTheme,
  personLabel,
  rankLabel,
  type Locale,
  type Theme,
} from './i18n';
import './styles.css';

type VoteSummary = { counts: number[]; total: number; leader: number };

const NEUTRAL_RANK = 2;
const SHARE_CARD_REV = '6';

function emptySummary(personId: string): VoteSummary {
  const counts = EMPTY_VOTES[personId] || [0, 0, 0, 0, 0, 0];
  return { counts, total: 0, leader: NEUTRAL_RANK };
}

function Avatar({
  person,
  className,
  labelled = false,
  rankIndex,
}: {
  person: Person;
  className: string;
  labelled?: boolean;
  rankIndex?: number;
}) {
  const avatarUrl = rankIndex === undefined
    ? person.avatarUrl
    : person.rankImageUrls?.[rankIndex] || person.avatarUrl;

  return (
    <span
      className={`${className} avatar-shell${avatarUrl ? ' meme-avatar' : ''}`}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? `${person.name} meme portrait` : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <span className="avatar-fallback">{person.accent}</span>
      {avatarUrl ? (
        <img
          className="avatar-photo"
          src={avatarUrl}
          alt=""
          loading="eager"
          referrerPolicy="no-referrer"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      ) : (
        <span
          className="avatar-image"
          style={{ backgroundPosition: `${person.avatarIndex / (PEOPLE.length - 1) * 100}% 0` }}
        />
      )}
    </span>
  );
}

export default function App() {
  const params = new URLSearchParams(location.search);
  const initialId = params.get('who') || 'liang';
  const openedFromShare = params.get('from') === 'share';
  const requestedRank = Number(params.get('rank') || NEUTRAL_RANK);
  const validRequestedRank = Number.isInteger(requestedRank) && requestedRank >= 0 && requestedRank <= 5
    ? requestedRank
    : NEUTRAL_RANK;

  const [locale, setLocale] = useState<Locale>(() => initialLocale());
  const [theme, setTheme] = useState<Theme>(() => initialTheme());
  const ui = UI[locale];
  const [personId, setPersonId] = useState(PEOPLE.some((p) => p.id === initialId) ? initialId : 'liang');
  const person = PEOPLE.find((p) => p.id === personId)!;
  const [rank, setRank] = useState(openedFromShare ? validRequestedRank : NEUTRAL_RANK);
  const [hasExplicitSelection, setHasExplicitSelection] = useState(openedFromShare);
  const explicitSelectionRef = useRef(openedFromShare);
  const [summary, setSummary] = useState<VoteSummary>(() => emptySummary(personId));
  const [liveResults, setLiveResults] = useState(false);
  const [voting, setVoting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState(() => openedFromShare ? UI[locale].openedShare : '');

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = ui.dek;
  }, [locale, ui.dek]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = theme === 'dark' ? '#171511' : '#efe5cf';
  }, [theme]);

  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('who', person.id);
    url.searchParams.set('rank', String(rank));
    url.searchParams.set('lang', locale);
    url.searchParams.delete('from');
    history.replaceState(null, '', url);
  }, [person.id, rank, locale]);

  const refreshSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/people/${person.id}`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('vote API unavailable');
      const data = await response.json() as VoteSummary;
      if (!Array.isArray(data.counts) || data.counts.length !== 6) throw new Error('invalid vote payload');
      const nextSummary = {
        counts: data.counts.map(Number),
        total: Number(data.total) || 0,
        leader: Number(data.leader),
      };
      setSummary(nextSummary);
      setLiveResults(true);
      if (!explicitSelectionRef.current) setRank(nextSummary.leader);
    } catch {
      setSummary(emptySummary(person.id));
      setLiveResults(false);
      if (!explicitSelectionRef.current) setRank(NEUTRAL_RANK);
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
  }, [refreshSummary]);

  useEffect(() => {
    for (const src of person.rankImageUrls || []) {
      const image = new Image();
      image.src = src;
    }
  }, [person]);

  const current = person.ranks[summary.leader] || person.ranks[NEUTRAL_RANK];
  const selected = person.ranks[rank] || person.ranks[NEUTRAL_RANK];
  const visualRank = hasExplicitSelection ? rank : summary.leader;
  const visual = person.ranks[visualRank] || person.ranks[NEUTRAL_RANK];
  const shareText = useMemo(() => ui.shareText(person, selected), [ui, person, selected]);

  function selectRank(nextRank: number) {
    explicitSelectionRef.current = true;
    setHasExplicitSelection(true);
    setRank(nextRank);
  }

  function switchPerson(nextId: string) {
    explicitSelectionRef.current = false;
    setHasExplicitSelection(false);
    setRank(NEUTRAL_RANK);
    setNotice('');
    if (nextId === person.id) {
      setRank(summary.leader);
      return;
    }
    setPersonId(nextId);
    setSummary(emptySummary(nextId));
    setLiveResults(false);
  }

  function toggleLocale() {
    setLocale((value) => value === 'zh' ? 'en' : 'zh');
    setNotice('');
  }

  function toggleTheme() {
    setTheme((value) => value === 'dark' ? 'light' : 'dark');
  }

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
        setNotice(ui.rateLimited);
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
      setNotice(ui.voteSaved(rankLabel(selected, locale)));
    } catch {
      setNotice(ui.voteFailed);
    } finally {
      setVoting(false);
    }
  }

  function buildXIntent(shareUrl: string) {
    const intent = new URL('https://x.com/intent/tweet');
    intent.searchParams.set('text', shareText);
    intent.searchParams.set('url', shareUrl);
    return intent.toString();
  }

  async function copyImage(blob: Blob) {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return false;
    try {
      const type = blob.type || 'image/png';
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      return true;
    } catch {
      return false;
    }
  }

  async function shareToX() {
    const shareUrl = `${location.origin}/share/${encodeURIComponent(person.id)}/${rank}?v=${SHARE_CARD_REV}&lang=${locale}`;
    const imageUrl = `${location.origin}/share-cards/${encodeURIComponent(person.id)}-${rank}.png?v=${SHARE_CARD_REV}`;
    const intentUrl = buildXIntent(shareUrl);
    const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const canTryNativeShare = coarsePointer && typeof navigator.share === 'function';

    setSharing(true);
    setNotice(ui.preparingSelected);

    if (!canTryNativeShare) window.open(intentUrl, '_blank', 'noopener,noreferrer');

    try {
      const response = await fetch(imageUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('share image unavailable');
      const blob = await response.blob();
      const file = new File([blob], `${person.id}-${rank}.png`, { type: blob.type || 'image/png' });

      if (canTryNativeShare) {
        const supportsFiles = typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
        if (supportsFiles) {
          await navigator.share({
            files: [file],
            text: shareText,
            url: shareUrl,
            title: ui.shareTitle(person, selected),
          });
          setNotice(ui.nativeShared);
          return;
        }
        window.open(intentUrl, '_blank', 'noopener,noreferrer');
      }

      const copied = await copyImage(blob);
      setNotice(copied ? ui.copiedImage : ui.configuredImage);
    } catch (error) {
      if (canTryNativeShare && !(error instanceof DOMException && error.name === 'AbortError')) {
        window.open(intentUrl, '_blank', 'noopener,noreferrer');
      }
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setNotice(ui.fallbackShare);
      }
    } finally {
      setSharing(false);
    }
  }

  const secondaryPersonName = locale === 'zh' ? person.name : person.nameZh;
  const selectedPrimary = rankLabel(selected, locale);
  const selectedSecondary = locale === 'zh' ? selected.en : selected.zh;

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">{ui.eyebrow}</p>
          <h1>Awesome Fame Slider</h1>
          <p className="dek">{ui.dek}</p>
        </div>
        <div className="header-actions">
          <div className="utility-controls" aria-label="Display settings">
            <button className="utility-toggle" type="button" onClick={toggleLocale} aria-label={ui.languageAria} title={ui.languageAria}>
              {ui.languageButton}
            </button>
            <button
              className="utility-toggle theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? ui.switchToLight : ui.switchToDark}
              title={theme === 'dark' ? ui.switchToLight : ui.switchToDark}
            >
              {theme === 'dark' ? `☀ ${ui.lightTheme}` : `☾ ${ui.darkTheme}`}
            </button>
          </div>
          <a className="github" href="https://github.com/mattamior/awesome-fame-slider" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>

      <nav className="people" aria-label={ui.people}>
        {PEOPLE.map((p) => (
          <button key={p.id} disabled={voting} className={p.id === person.id ? 'active' : ''} onClick={() => switchPerson(p.id)}>
            <Avatar person={p} className="mini-avatar" /><span>{personLabel(p, locale)}</span>
          </button>
        ))}
      </nav>

      <section className={`instrument${person.rankImageUrls ? ' meme-person' : ''}`}>
        <div className="plate-top">
          <div className="subject">
            <Avatar person={person} className="subject-avatar" labelled rankIndex={summary.leader} />
            <div className="subject-copy">
              <span className="label">{ui.subject}</span>
              <strong>{personLabel(person, locale)}</strong>
              <small>{secondaryPersonName} · {person.role}</small>
              {person.avatarSourceUrl && (
                <a className="meme-source" href={person.avatarSourceUrl} target="_blank" rel="noreferrer">{ui.memeSource}</a>
              )}
            </div>
          </div>
          <div className="community">
            <span className="label">{ui.communityNow}</span>
            <strong>{rankLabel(current, locale)}</strong>
            <small>{liveResults ? ui.anonymousVotes(summary.total) : ui.liveUnavailable}</small>
          </div>
        </div>

        {person.rankImageUrls && (
          <div className="rank-visual" aria-live="polite">
            <img
              key={`${person.id}-${visualRank}`}
              src={person.rankImageUrls[visualRank]}
              alt={`${personLabel(person, locale)} — ${rankLabel(visual, locale)}`}
              referrerPolicy="no-referrer"
            />
            <span className="rank-visual-tag">{ui.rankTag(visualRank, rankLabel(visual, locale))}</span>
          </div>
        )}

        <div className="track-wrap">
          <div className="coil" />
          <input disabled={voting} aria-label={ui.sliderLabel} type="range" min="0" max="5" step="1" value={rank} onChange={(e) => selectRank(Number(e.target.value))} />
          <div className="thumb-face" style={{ left: `calc(${rank / 5 * 100}% - 33px)` }}>
            <Avatar person={person} className="thumb-avatar" rankIndex={rank} />
          </div>
        </div>

        <div className="rank-labels">
          {person.ranks.map((r, i) => <button disabled={voting} key={r.id} className={i === rank ? 'chosen' : ''} onClick={() => selectRank(i)}>{rankLabel(r, locale)}</button>)}
        </div>

        <div className="selected-card"><span>{ui.yourVerdict}</span><strong>{selectedPrimary}</strong><em>{selectedSecondary}</em></div>
        <div className="actions">
          <button className="vote" onClick={castVote} disabled={voting}>{voting ? ui.savingVote : ui.castVote}</button>
          <button className="share" onClick={() => void shareToX()} disabled={sharing}>{sharing ? ui.preparingImage : ui.shareToX}</button>
        </div>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="fine">{ui.fine}</p>
      </section>

      <section className="results" aria-live="polite">
        <div className="results-heading">
          <h2>{ui.currentDistribution}</h2>
          <span className={liveResults ? 'live-dot live' : 'live-dot'}>{liveResults ? ui.live : ui.offline}</span>
        </div>
        <div className="bars">
          {person.ranks.map((r, i) => {
            const pct = summary.total ? Math.round((summary.counts[i] / summary.total) * 100) : 0;
            return <div className="bar-row" key={r.id}><span>{rankLabel(r, locale)}</span><div className="bar"><i style={{ width: `${pct}%` }} /></div><b>{pct}%</b></div>;
          })}
        </div>
        {!liveResults && <p className="results-note">{ui.resultsUnavailable}</p>}
      </section>

      <footer>{ui.footer}</footer>
    </main>
  );
}
