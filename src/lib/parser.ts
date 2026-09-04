import { ContributionType, Member, Contribution, ParseResult, ParsedItem } from '@/types';
import { MONTHS } from './constants';

/**
 * Normalizes text for string comparison (removes accents, punctuation, extra spaces, lowercases)
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy match a raw string against existing member names.
 * Returns the best matched member or null.
 */
export function findBestMemberMatch(rawName: string, members: Member[]): Member | null {
  const normRaw = normalize(rawName);
  if (!normRaw) return null;

  // 1. Exact match
  const exact = members.find((m) => normalize(m.name) === normRaw);
  if (exact) return exact;

  // 2. Member name contains rawName or rawName contains member name
  const contains = members.find((m) => {
    const normM = normalize(m.name);
    return normM.includes(normRaw) || normRaw.includes(normM);
  });
  if (contains) return contains;

  // 3. Word token overlap match (e.g. "Lucas Omondi" matches "Pst Lucas Omondi", "Enos Masasi" matches "Min Enos Masasi")
  const rawTokens = normRaw.split(' ').filter((t) => t.length > 2 && !['min', 'pst', 'ev', 'bro', 'sis'].includes(t));
  if (rawTokens.length > 0) {
    let bestMatch: Member | null = null;
    let maxOverlap = 0;

    for (const m of members) {
      const mTokens = normalize(m.name).split(' ').filter((t) => t.length > 2 && !['min', 'pst', 'ev', 'bro', 'sis'].includes(t));
      let overlap = 0;
      for (const token of rawTokens) {
        if (mTokens.includes(token)) {
          overlap++;
        }
      }
      if (overlap > maxOverlap && overlap >= 1) {
        maxOverlap = overlap;
        bestMatch = m;
      }
    }

    if (bestMatch) return bestMatch;
  }

  return null;
}

/**
 * Detect month from raw text lines
 */
export function detectMonth(text: string): { month: string; year: number } {
  const currentYear = 2026;
  let detectedMonth = 'September';
  let detectedYear = currentYear;

  // Check for 4 digit year
  const yearMatch = text.match(/\b(202[4-9]|203[0-9])\b/);
  if (yearMatch) {
    detectedYear = parseInt(yearMatch[1], 10);
  }

  // Check for month names
  for (const m of MONTHS) {
    const regex = new RegExp(`\\b${m}\\b`, 'i');
    if (regex.test(text)) {
      detectedMonth = m;
      break;
    }
  }

  return { month: detectedMonth, year: detectedYear };
}

/**
 * Detect contribution type from raw text
 */
export function detectContributionType(text: string): ContributionType {
  const norm = text.toLowerCase();
  if (norm.includes('tea urn') || norm.includes('urn')) {
    return 'TEA_URN';
  }
  if (norm.includes('tea')) {
    return 'TEA';
  }
  if (norm.includes('monthly')) {
    return 'MONTHLY';
  }
  if (norm.includes('special') || norm.includes('fundrais') || norm.includes('gift')) {
    return 'SPECIAL';
  }
  return 'MONTHLY';
}

/**
 * Helper to clean and parse an amount string (e.g. "KES 100", "100/=", "1,500.00", "-")
 */
function parseCleanAmount(str: string): number | null {
  if (!str) return null;
  const clean = str
    .replace(/kes\.?/gi, '')
    .replace(/ksh\.?/gi, '')
    .replace(/\/=/g, '')
    .replace(/,/g, '')
    .trim();

  if (clean === '' || clean === '-' || clean === 'nil' || clean === 'none' || clean === 'n/a') {
    return null;
  }

  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Checks if a row looks like an Excel/table header
 */
function isHeaderRow(line: string): boolean {
  const lower = line.toLowerCase();
  if (
    lower.includes('member name') ||
    lower.includes('full name') ||
    (lower.includes('name') && lower.includes('amount')) ||
    (lower.includes('no') && lower.includes('name')) ||
    lower.includes('contribution') && lower.includes('amount') ||
    lower.includes('phone') && lower.includes('amount')
  ) {
    return true;
  }
  return false;
}

/**
 * Main parser function: Parses Excel / Google Sheets (tab-separated), CSV, WhatsApp, or ChatGPT lists.
 */
export function parseContributionList(
  rawInput: string,
  existingMembers: Member[],
  existingContributions: Contribution[],
  overrideMonth?: string,
  overrideYear?: number,
  overrideType?: ContributionType
): ParseResult {
  const lines = rawInput.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  const { month: detectedMonth, year: detectedYear } = detectMonth(rawInput);
  const detectedType = detectContributionType(rawInput);

  const activeMonth = overrideMonth || detectedMonth;
  const activeYear = overrideYear || detectedYear;
  const activeType = overrideType || detectedType;

  const parsedItems: ParsedItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip general banner/title lines if they don't look like member entries
    const isBannerOnly =
      /^(praise|worship|team|monthly|tea|contribution|month:|year:|date:|\*+praise|\*+month|\*+tea)/i.test(
        line.replace(/[*_~#]/g, '').trim()
      ) && !/\d+\.\s+[a-zA-Z]/.test(line);

    if (isBannerOnly && lines.length > 3) {
      continue;
    }

    // Skip header rows from Excel (e.g. "No\tName\tAmount\tStatus")
    if (isHeaderRow(line)) {
      continue;
    }

    let namePart = '';
    let amountPart = '';

    // Check if line is Tab-Separated (Excel copy paste) or CSV
    if (line.includes('\t') || (line.includes(',') && !line.includes(' - ') && !line.includes(' : '))) {
      const delimiter = line.includes('\t') ? '\t' : ',';
      const cols = line.split(delimiter).map((c) => c.trim()).filter((c) => c.length > 0);

      if (cols.length === 1) {
        namePart = cols[0];
      } else if (cols.length === 2) {
        // Either [Name, Amount] or [#1, Name]
        if (/^\d+$/.test(cols[0]) && !/^\d+$/.test(cols[1])) {
          namePart = cols[1];
        } else {
          namePart = cols[0];
          amountPart = cols[1];
        }
      } else if (cols.length >= 3) {
        // E.g. [#, Name, Amount] or [Name, Phone, Amount] or [#, Name, Phone, Amount]
        if (/^\d+$/.test(cols[0])) {
          // col 0 is index
          namePart = cols[1];
          // check if col 2 or col 3 is amount
          const amtCol2 = parseCleanAmount(cols[2]);
          if (amtCol2 !== null) {
            amountPart = cols[2];
          } else if (cols[3]) {
            amountPart = cols[3];
          }
        } else {
          // col 0 is Name
          namePart = cols[0];
          // find first numeric col
          for (let c = 1; c < cols.length; c++) {
            if (parseCleanAmount(cols[c]) !== null) {
              amountPart = cols[c];
              break;
            }
          }
        }
      }
    } else {
      // Clean WhatsApp markdown symbols: *bold*, _italic_, ~strike~
      const cleanLine = line.replace(/[*_~]/g, '').trim();

      // Strip leading numbers or bullets (e.g. "1.", "1)", "-", "•", "*", "#1")
      const withoutPrefix = cleanLine.replace(/^([#]?\d+[\.\)\-:]|\-|\•|\*|\+)\s*/, '').trim();

      if (!withoutPrefix) continue;

      // Regex trying to split on separator like " - ", " : ", " = "
      const sepMatch = withoutPrefix.match(/^(.*?)(?:\s*[-:=–—]\s*)(.*)$/);

      if (sepMatch) {
        namePart = sepMatch[1].trim();
        amountPart = sepMatch[2].trim();
      } else {
        // Maybe trailing digits e.g. "Denzel Gitonga 100" or "Denzel Gitonga KES 100"
        const trailingDigitMatch = withoutPrefix.match(/^(.*?)[\s\t]+(kes\.?|ksh\.?)?\s*(\d+(?:,\d+)*(?:\.\d+)?(?:\/=)?)$/i);
        if (trailingDigitMatch) {
          namePart = trailingDigitMatch[1].trim();
          amountPart = trailingDigitMatch[3].trim();
        } else {
          namePart = withoutPrefix;
          amountPart = '';
        }
      }
    }

    // Check if name is non-empty
    if (!namePart || namePart.length < 2) continue;

    // Parse amount
    const amount = parseCleanAmount(amountPart);

    // Match member against existing database members
    const matchedMember = findBestMemberMatch(namePart, existingMembers);

    // Duplicate check
    let status: ParsedItem['status'] = 'VALID';
    let duplicateWarning: string | undefined;

    if (amount === null || isNaN(amount)) {
      status = 'BLANK';
    }

    if (!matchedMember) {
      status = 'UNKNOWN_MEMBER';
    } else {
      // Check if this member already has a contribution for this month, year, and type
      const existing = existingContributions.find(
        (c) =>
          c.memberId === matchedMember.id &&
          c.month.toLowerCase() === activeMonth.toLowerCase() &&
          c.year === activeYear &&
          c.type === activeType
      );

      if (existing) {
        status = 'DUPLICATE';
        duplicateWarning = `Already recorded ${existing.type} (KES ${existing.amount}) for ${existing.month} ${existing.year}`;
      }
    }

    parsedItems.push({
      id: `parsed-${i}-${Date.now()}`,
      originalText: line,
      rawName: namePart,
      matchedMemberId: matchedMember ? matchedMember.id : null,
      matchedMemberName: matchedMember ? matchedMember.name : namePart,
      isNewMember: !matchedMember,
      amount,
      status,
      duplicateWarning,
      duplicateAction: 'REPLACE',
    });
  }

  const validCount = parsedItems.filter((i) => i.amount !== null && i.amount > 0).length;
  const blankCount = parsedItems.filter((i) => i.amount === null).length;
  const totalAmount = parsedItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  return {
    detectedMonth: activeMonth,
    detectedYear: activeYear,
    detectedType: activeType,
    totalParsed: parsedItems.length,
    validCount,
    blankCount,
    totalAmount,
    items: parsedItems,
  };
}
