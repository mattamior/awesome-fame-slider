import { describe, expect, it } from 'vitest';
import { leader, shareCardPath, shareCopy, sharePageHtml, sharePath, validRank } from './index';

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

describe('free share flow', () => {
  it('uses the selected localized verdict without requiring an X API post', () => {
    expect(shareCopy('liang', 1)).toBe("My vote for Liang Wenfeng: 牢梁 (Jailed 梁). What's your verdict?");
    expect(shareCopy('tibo', 4)).toContain('Tibo神');
  });

  it('uses stable share and card paths', () => {
    expect(sharePath('liang', 1)).toBe('/share/liang/1');
    expect(shareCardPath('liang', 1)).toBe('/share-cards/liang-1.png');
  });

  it('renders crawler-safe large-image metadata for the selected rank', () => {
    const html = sharePageHtml('liang', 1, 'https://slide.example/share/liang/1?v=3');
    expect(html).toContain('twitter:card');
    expect(html).toContain('summary_large_image');
    expect(html).toContain('twitter:image:src');
    expect(html).toContain('og:image:secure_url');
    expect(html).toContain('og:image:type');
    expect(html).toContain('image/png');
    expect(html).toContain('https://slide.example/share-cards/liang-1.png');
    expect(html).toContain('https://slide.example/share/liang/1?v=3');
    expect(html).toContain('https://slide.example/?who=liang&amp;rank=1&amp;from=share');
    expect(html).toContain('window.location.replace');
    expect(html).not.toContain('http-equiv="refresh"');
  });
});
