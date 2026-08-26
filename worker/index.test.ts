import { describe, expect, it } from 'vitest';
import { canonicalOrigin, leader, postText, validRank } from './index';

describe('leader', () => {
  it('uses neutral rank when there are no votes', () => {
    expect(leader([0, 0, 0, 0, 0, 0])).toBe(2);
  });

  it('returns the modal rank', () => {
    expect(leader([1, 2, 8, 3, 2, 1])).toBe(2);
    expect(leader([1, 2, 3, 9, 2, 1])).toBe(3);
  });

  it('breaks ties toward neutral, then lower rank', () => {
    expect(leader([5, 0, 5, 0, 0, 0])).toBe(2);
    expect(leader([0, 0, 5, 5, 0, 0])).toBe(2);
    expect(leader([0, 5, 0, 5, 0, 0])).toBe(1);
  });
});

describe('validRank', () => {
  it('accepts integer ranks 0 through 5', () => {
    for (let rank = 0; rank <= 5; rank += 1) expect(validRank(rank)).toBe(rank);
    expect(validRank('3')).toBe(3);
  });

  it('rejects out-of-range and non-integer values', () => {
    expect(validRank(-1)).toBeNull();
    expect(validRank(6)).toBeNull();
    expect(validRank(2.5)).toBeNull();
    expect(validRank('nope')).toBeNull();
  });
});

describe('share copy', () => {
  it('removes a trailing slash from APP_ORIGIN', () => {
    expect(canonicalOrigin({ APP_ORIGIN: 'https://slide.example/' })).toBe('https://slide.example');
  });

  it('uses the selected localized verdict and deep link', () => {
    expect(postText('liang', 1, { APP_ORIGIN: 'https://slide.example/' })).toBe(
      "My vote for Liang Wenfeng: 牢梁\n\nWhat's your verdict? → https://slide.example/?who=liang&rank=1",
    );
  });

  it('covers Tibo in the launch roster', () => {
    expect(postText('tibo', 4, { APP_ORIGIN: 'https://slide.example' })).toContain('Tibo神');
  });
});
