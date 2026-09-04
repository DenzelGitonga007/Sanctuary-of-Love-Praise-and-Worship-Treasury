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
 * Main parser function: Parses ChatGPT / WhatsApp contribution lists.
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

    // Skip general header/title lines if they don't look like member entries
    const isHeaderOnly =
      /^(praise|worship|team|monthly|tea|contribution|month:|year:|date:|\*+praise|\*+month|\*+tea)/i.test(
        line.replace(/[*_~#]/g, '').trim()
      ) && !/\d+\.\s+[a-zA-Z]/.test(line);

    if (isHeaderOnly && lines.length > 3) {
      continue;
    }

    // Clean markdown/WhatsApp symbols: *bold*, _italic_, ~strike~
    const cleanLine = line.replace(/[*_~]/g, '').trim();

    // Line patterns:
    // "1. Min Enos Masasi - 100"
    // "2. Min Ann Musyoka - "
    // "3. Pst Priscah Enos - KES 100/="
    // "- Denzel Gitonga: 100"
    // "• Derrington Okwomi - 100"
    
    // Strip leading numbers or bullets (e.g. "1.", "1)", "-", "•", "*")
    const withoutPrefix = cleanLine.replace(/^(\d+[\.\)\-:]|\-|\•|\*|\+)\s*/, '').trim();

    if (!withoutPrefix) continue;

    // Split name and amount by separator (- , : , = , tab) or trailing digits
    let namePart = '';
    let amountPart = '';

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
        // Just the name with no separator / amount
        namePart = withoutPrefix;
        amountPart = '';
      }
    }

    // Check if name is non-empty
    if (!namePart || namePart.length < 2) continue;

    // Parse amount
    let amount: number | null = null;
    const cleanAmountStr = amountPart
      .replace(/kes\.?/gi, '')
      .replace(/ksh\.?/gi, '')
      .replace(/\/=/g, '')
      .replace(/,/g, '')
      .trim();

    if (cleanAmountStr && /^\d+(\.\d+)?$/.test(cleanAmountStr)) {
      amount = parseFloat(cleanAmountStr);
    }

    // Match member
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
