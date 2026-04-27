const STYLE_KEYWORDS: Record<string, string[]> = {
  미니멀: ["minimal"],
  심플: ["minimal"],
  베이직: ["minimal"],
  캐주얼: ["casual"],
  데일리: ["daily", "casual"],
  포멀: ["formal"],
  세미포멀: ["formal", "office"],
  정장: ["formal", "office"],
  오피스: ["office"],
  출근: ["office", "formal"],
  스트릿: ["street"],
  힙합: ["street"],
  페미닌: ["feminine"],
  여성스러운: ["feminine"],
  러블리: ["feminine"],
  걸리시: ["feminine"],
  빈티지: ["vintage"],
  레트로: ["vintage"],

  봄: ["spring"],
  여름: ["summer"],
  가을: ["fall"],
  겨울: ["winter"],

  데이트: ["date"],
  소개팅: ["date"],
  출근룩: ["office"],
  데일리룩: ["daily"],
  하객룩: ["formal"],

  셔츠: ["shirt"],
  티셔츠: ["tshirt"],
  반팔: ["tshirt", "summer"],
  긴팔: ["tshirt"],
  후드: ["hoodie"],
  후디: ["hoodie"],
  슬랙스: ["slacks"],
  청바지: ["jeans"],
  데님: ["jeans"],
  블레이저: ["blazer"],
  자켓: ["jacket"],
  재킷: ["jacket"],
  원피스: ["dress"],
  드레스: ["dress"],
  스커트: ["skirt"],
  치마: ["skirt"],
  코트: ["coat"],
  니트: ["knit"],
  카디건: ["cardigan"],
  스니커즈: ["sneakers"],
  운동화: ["sneakers"],
  팬츠: ["pants"],
  바지: ["pants"],
  쇼츠: ["shorts"],
  반바지: ["shorts"],
};

export interface ExtractedKeywords {
  keywords: string[];
  style_tags: string[];
  budget_max: number | null;
}

export function extractKeywords(prompt: string): ExtractedKeywords {
  const normalized = prompt.toLowerCase().trim();
  const foundKeywords = new Set<string>();
  const foundTags = new Set<string>();

  for (const [ko, tags] of Object.entries(STYLE_KEYWORDS)) {
    if (normalized.includes(ko.toLowerCase())) {
      foundKeywords.add(ko);
      tags.forEach((t) => foundTags.add(t));
    }
  }

  const budgetMax = parseBudget(prompt);

  return {
    keywords: Array.from(foundKeywords),
    style_tags: Array.from(foundTags),
    budget_max: budgetMax,
  };
}

function parseBudget(prompt: string): number | null {
  const manMatch = prompt.match(/(\d+)\s*만\s*원/);
  if (manMatch) {
    return parseInt(manMatch[1], 10) * 10000;
  }

  const chunMatch = prompt.match(/(\d+)\s*천\s*원/);
  if (chunMatch) {
    return parseInt(chunMatch[1], 10) * 1000;
  }

  const wonMatch = prompt.match(/(\d[\d,]*)\s*원/);
  if (wonMatch) {
    const num = parseInt(wonMatch[1].replace(/,/g, ""), 10);
    if (num >= 10000) return num;
  }

  return null;
}

export function getStyleSummary(prompt: string, tags: string[]): string {
  const trimmed = prompt.trim();
  if (trimmed.length <= 30) return trimmed;

  const labelMap: Record<string, string> = {
    minimal: "미니멀",
    casual: "캐주얼",
    formal: "포멀",
    street: "스트릿",
    feminine: "페미닌",
    vintage: "빈티지",
    spring: "봄",
    summer: "여름",
    fall: "가을",
    winter: "겨울",
    date: "데이트",
    office: "출근",
    daily: "데일리",
  };

  const toneTags = tags
    .filter((t) => labelMap[t])
    .slice(0, 3)
    .map((t) => labelMap[t]);

  if (toneTags.length === 0) return trimmed.slice(0, 30) + "...";
  return `${toneTags.join(" · ")} 스타일`;
}

import type { UserProfile } from "./types";

const AGE_LABEL: Record<string, string> = {
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50plus": "50대 이상",
};

const TONE_LABEL: Record<string, string> = {
  minimal: "미니멀한",
  casual: "캐주얼한",
  formal: "포멀한",
  street: "스트릿한",
  feminine: "페미닌한",
  vintage: "빈티지한",
};

const SITUATION_LABEL: Record<string, string> = {
  date: "데이트",
  office: "출근",
  daily: "데일리",
};

const SEASON_LABEL: Record<string, string> = {
  spring: "봄",
  summer: "여름",
  fall: "가을",
  winter: "겨울",
};

interface CommentInput {
  prompt: string;
  styleTags: string[];
  budgetMax: number | null;
  productCount: number;
  profile?: UserProfile;
}

export function generateAIComment(input: CommentInput): string {
  const { styleTags, budgetMax, productCount, profile } = input;

  const personaText =
    profile?.ageGroup && AGE_LABEL[profile.ageGroup]
      ? `${AGE_LABEL[profile.ageGroup]} 여성`
      : "";

  const tone = styleTags
    .map((t) => TONE_LABEL[t])
    .filter(Boolean)
    .slice(0, 1);
  const situation = styleTags
    .map((t) => SITUATION_LABEL[t])
    .filter(Boolean)
    .slice(0, 1);
  const season = styleTags
    .map((t) => SEASON_LABEL[t])
    .filter(Boolean)
    .slice(0, 1);

  const descriptors: string[] = [];
  if (season.length > 0) descriptors.push(season[0]);
  if (tone.length > 0) descriptors.push(tone[0]);
  if (situation.length > 0) descriptors.push(situation[0] + "룩");

  const styleText =
    descriptors.length > 0
      ? `${descriptors.join(" ").replace(/\s+/g, " ").trim()} 스타일`
      : "요청하신 스타일";

  const subjectClause = personaText
    ? `${personaText}에게 어울리는 ${styleText}`
    : styleText;

  const budgetClause =
    budgetMax !== null
      ? ` ${budgetMax.toLocaleString()}원 이하 가격대로`
      : "";

  return `${subjectClause}을 분석했어요.${budgetClause} 조건에 맞는 ${productCount}개 아이템을 골라드렸어요.`;
}

export function buildPersonalizedQueries(
  prompt: string,
  keywords: string[],
  _profile?: UserProfile,
): string[] {
  void _profile;
  const cleanedPrompt = prompt
    .replace(/(\d+\s*만\s*원\s*(이하|이내|미만)?)/g, "")
    .replace(/(\d+\s*천\s*원\s*(이하|이내|미만)?)/g, "")
    .replace(/(\d[\d,]*\s*원\s*(이하|이내|미만)?)/g, "")
    .replace(/예산.*?(?=,|$)/g, "")
    .replace(/[,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const queries = new Set<string>();

  if (cleanedPrompt) {
    queries.add(`여자 ${cleanedPrompt}`);
  }

  if (keywords.length >= 2) {
    const kwQuery = keywords.slice(0, 3).join(" ");
    queries.add(`여자 ${kwQuery}`);
  }

  return Array.from(queries).slice(0, 2);
}
