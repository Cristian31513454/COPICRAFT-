export interface ToneScores {
  persuasiveness: number;
  clarity: number;
  professionalism: number;
  engagement: number;
}

export interface AnalysisResult {
  seoScore: number;
  readabilityGrade: string;
  readabilityScore: number;
  sentimentTone: string;
  toneScores: ToneScores;
  suggestedKeywords: string[];
  improvementTips: string[];
}

export interface MetaAnalysis {
  titleTag: string;
  metaDescription: string;
  urlSlug: string;
  headerStructureTips: string[];
}

export interface ContentProject {
  id: string;
  title: string;
  content: string;
  targetKeyword: string;
  createdAt: string;
  lastAnalysis?: AnalysisResult;
  lastMetadata?: MetaAnalysis;
}

export type WritingTone =
  | "Persuasivo"
  | "Profesional"
  | "Casual"
  | "Viral LinkedIn"
  | "Técnico"
  | "Directo y Caliente";
