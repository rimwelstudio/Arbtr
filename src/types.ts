export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ProConItem {
  id: string;
  text: string;
  category?: string;
  impact: ImpactLevel;
  rationale?: string;
  mitigation?: string; // For cons, how to address it
  userAdded?: boolean;
}

export interface OptionAnalysis {
  id: string;
  name: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  score: number; // 1-100 overall fit score
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  importanceWeight: number; // 1 to 5
  scores: Record<string, number>; // optionId -> score (1-5 or 1-10)
  explanations: Record<string, string>; // optionId -> brief justification
  leadingOptionId: string;
}

export interface SWOTQuadrant {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicImplication: string;
}

export interface TiebreakerVerdict {
  recommendedOptionId: string;
  recommendedOptionName: string;
  confidenceScore: number; // e.g. 85%
  theTiebreakerFactor: string; // The single decisive pivot point
  coreReasoning: string;
  regretMinimizationCheck: string; // The "10-10-10" or 80-year-old test
  gutCheckQuestion: string; // Intuitive question to test inner instinct
  actionPlan: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  criticalRisksToWatch: string[];
}

export type FeedbackRating = 'thumbs-up' | 'thumbs-down';

export interface InsightFeedbackItem {
  rating: FeedbackRating;
  reason?: string;
  notes?: string;
  timestamp: string;
}

export interface DecisionAnalysisResult {
  id: string;
  createdAt: string;
  title: string;
  context?: string;
  options: OptionAnalysis[];
  comparisonMatrix: {
    criteria: ComparisonCriterion[];
    analysisSummary: string;
  };
  swotAnalysis: Record<string, SWOTQuadrant>; // keyed by optionId or "overall"
  verdict: TiebreakerVerdict;
  language?: string;
  translatedTo?: string;
  originalVersion?: DecisionAnalysisResult;
  feedback?: Record<string, InsightFeedbackItem>;
}

export interface DecisionPreset {
  id: string;
  title: string;
  category: string;
  context: string;
  options: string[];
  priorities: string[];
}
