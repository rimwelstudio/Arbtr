export type ValueCategory =
  | 'financial'
  | 'lifestyle'
  | 'career'
  | 'wellbeing'
  | 'autonomy'
  | 'technical'
  | 'strategic';

export interface PriorityDefinition {
  id: string;
  name: string;
  category: ValueCategory;
  categoryLabel: string;
  categoryBadgeClass: {
    bg: string;
    text: string;
    border: string;
  };
  description: string;
  recommendedOrder: number;
}

export const CATEGORY_DEFINITIONS: Record<
  ValueCategory,
  {
    label: string;
    description: string;
    color: string;
    badgeClass: { bg: string; text: string; border: string };
  }
> = {
  financial: {
    label: 'Financial & Wealth',
    description: 'Compensation, asset building, risk exposure, and living costs',
    color: 'emerald',
    badgeClass: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/80',
    },
  },
  lifestyle: {
    label: 'Lifestyle & Freedom',
    description: 'Work-life balance, schedule autonomy, commute, and location',
    color: 'sky',
    badgeClass: {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800/80',
    },
  },
  career: {
    label: 'Career & Trajectory',
    description: 'Professional growth, pedigree, promotions, and network',
    color: 'indigo',
    badgeClass: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800/80',
    },
  },
  wellbeing: {
    label: 'Wellbeing & Personal',
    description: 'Physical health, psychological safety, and family time',
    color: 'rose',
    badgeClass: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800/80',
    },
  },
  autonomy: {
    label: 'Autonomy & Creativity',
    description: 'Creative control, agency, low bureaucracy, and ownership',
    color: 'amber',
    badgeClass: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/80',
    },
  },
  technical: {
    label: 'Technical & Execution',
    description: 'Velocity, system reliability, operational simplicity, and debt',
    color: 'violet',
    badgeClass: {
      bg: 'bg-violet-50 dark:bg-violet-950/60',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200 dark:border-violet-800/80',
    },
  },
  strategic: {
    label: 'Strategic & Risk',
    description: 'Reversibility, opportunity cost, and regret minimization',
    color: 'teal',
    badgeClass: {
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800/80',
    },
  },
};

export const ALL_SUGGESTED_PRIORITIES: PriorityDefinition[] = [
  // Financial
  {
    id: 'financial-upside',
    name: 'Financial Upside',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Maximize monetary compensation, variable incentives, and earning potential',
    recommendedOrder: 1,
  },
  {
    id: 'financial-growth',
    name: 'Financial Growth',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Accelerated salary increases, bonuses, and financial advancement',
    recommendedOrder: 2,
  },
  {
    id: 'financial-security',
    name: 'Financial Security',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Predictable recurring earnings, downside protection, and emergency safety',
    recommendedOrder: 3,
  },
  {
    id: 'wealth-accumulation',
    name: 'Wealth Accumulation',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Long-term equity compounding, index investing, and net worth growth',
    recommendedOrder: 4,
  },
  {
    id: 'equity-ownership',
    name: 'Equity & Ownership',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Meaningful stock options, cap table percentage, and founder upside',
    recommendedOrder: 5,
  },
  {
    id: 'cost-of-living',
    name: 'Cost of Living',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Lower monthly overhead, housing affordability, and tax advantages',
    recommendedOrder: 6,
  },
  {
    id: 'gross-margins',
    name: 'Gross Margins',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'High return on investment, pricing leverage, and capital efficiency',
    recommendedOrder: 7,
  },
  {
    id: 'immediate-financial-health',
    name: 'Immediate Financial Health',
    category: 'financial',
    categoryLabel: 'Financial & Wealth',
    categoryBadgeClass: CATEGORY_DEFINITIONS.financial.badgeClass,
    description: 'Near-term liquidity, debt paydown speed, and immediate cash flow',
    recommendedOrder: 8,
  },

  // Lifestyle & Freedom
  {
    id: 'work-life-balance',
    name: 'Work-Life Balance',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Protected evenings and weekends, manageable pacing, and burnout prevention',
    recommendedOrder: 9,
  },
  {
    id: 'flexibility-freedom',
    name: 'Flexibility & Freedom',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Discretion over daily schedule, calendar autonomy, and life flexibility',
    recommendedOrder: 10,
  },
  {
    id: 'remote-flexibility',
    name: 'Remote Flexibility',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Work-from-anywhere freedom, asynchronous workflow, and no office mandate',
    recommendedOrder: 11,
  },
  {
    id: 'short-commute',
    name: 'Short Commute',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Minimal daily travel time, walkable access, and zero transit friction',
    recommendedOrder: 12,
  },
  {
    id: 'walkability-social-life',
    name: 'Walkability & Social Life',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Vibrant neighborhood amenities, cultural hubs, and effortless socializing',
    recommendedOrder: 13,
  },
  {
    id: 'outdoor-access',
    name: 'Outdoor Access',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Proximity to nature, trails, parks, sunshine, and recreational sports',
    recommendedOrder: 14,
  },
  {
    id: 'daily-stimulation',
    name: 'Daily Stimulation',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Dynamic environment, energetic pace, curiosity, and intellectual variety',
    recommendedOrder: 15,
  },
  {
    id: 'flexibility-to-relocate',
    name: 'Flexibility to Relocate',
    category: 'lifestyle',
    categoryLabel: 'Lifestyle & Freedom',
    categoryBadgeClass: CATEGORY_DEFINITIONS.lifestyle.badgeClass,
    description: 'Geographic portability and low friction to move if circumstances change',
    recommendedOrder: 16,
  },

  // Career & Trajectory
  {
    id: 'career-growth',
    name: 'Career Growth',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'Rapid promotion trajectory, leadership opportunities, and skill expansion',
    recommendedOrder: 17,
  },
  {
    id: 'career-trajectory',
    name: 'Career Trajectory',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'High brand prestige, resume compounding, and industry standing',
    recommendedOrder: 18,
  },
  {
    id: 'long-term-career-upside',
    name: 'Long-Term Career Upside',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'Strategic 5-to-10 year positioning in high-growth transformational sectors',
    recommendedOrder: 19,
  },
  {
    id: 'job-security',
    name: 'Job Security',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'Low vulnerability to macroeconomic downturns and institutional stability',
    recommendedOrder: 20,
  },
  {
    id: 'network-expansion',
    name: 'Network Expansion',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'Connections with high-caliber mentors, ambitious peers, and industry leaders',
    recommendedOrder: 21,
  },
  {
    id: 'team-company-culture',
    name: 'Team & Company Culture',
    category: 'career',
    categoryLabel: 'Career & Trajectory',
    categoryBadgeClass: CATEGORY_DEFINITIONS.career.badgeClass,
    description: 'Empathetic peers, high mission alignment, and low organizational politics',
    recommendedOrder: 22,
  },

  // Wellbeing & Personal
  {
    id: 'peace-of-mind',
    name: 'Peace of Mind',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Minimal psychological stress, emotional calm, and predictable sleep',
    recommendedOrder: 23,
  },
  {
    id: 'health-wellbeing',
    name: 'Health & Wellbeing',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Physical vitality, mental health, workout consistency, and nutrition',
    recommendedOrder: 24,
  },
  {
    id: 'psychological-safety',
    name: 'Psychological Safety',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Freedom to express opinions and make honest mistakes without fear of retribution',
    recommendedOrder: 25,
  },
  {
    id: 'family-relationships',
    name: 'Family & Relationships',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Quality time and presence for partner, children, parents, and close loved ones',
    recommendedOrder: 26,
  },
  {
    id: 'space-for-pets-family',
    name: 'Space for Pets/Family',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Living square footage, yard for animals, safe school district, and room to grow',
    recommendedOrder: 27,
  },
  {
    id: 'workload-health',
    name: 'Workload & Health',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Sustainable cognitive load without relentless high-urgency crises',
    recommendedOrder: 28,
  },
  {
    id: 'community-friends',
    name: 'Community & Friends',
    category: 'wellbeing',
    categoryLabel: 'Wellbeing & Personal',
    categoryBadgeClass: CATEGORY_DEFINITIONS.wellbeing.badgeClass,
    description: 'Close physical proximity to loyal friendships and neighborhood belonging',
    recommendedOrder: 29,
  },

  // Autonomy & Creativity
  {
    id: 'autonomy-ownership',
    name: 'Autonomy & Ownership',
    category: 'autonomy',
    categoryLabel: 'Autonomy & Creativity',
    categoryBadgeClass: CATEGORY_DEFINITIONS.autonomy.badgeClass,
    description: 'Independent decision-making power, low bureaucracy, and accountability',
    recommendedOrder: 30,
  },
  {
    id: 'creativity-learning',
    name: 'Creativity & Learning',
    category: 'autonomy',
    categoryLabel: 'Autonomy & Creativity',
    categoryBadgeClass: CATEGORY_DEFINITIONS.autonomy.badgeClass,
    description: 'Steep learning curve, curiosity-driven exploration, and artistic craft',
    recommendedOrder: 31,
  },
  {
    id: 'creative-autonomy',
    name: 'Creative Autonomy',
    category: 'autonomy',
    categoryLabel: 'Autonomy & Creativity',
    categoryBadgeClass: CATEGORY_DEFINITIONS.autonomy.badgeClass,
    description: 'Control over creative direction, product vision, and expressive freedom',
    recommendedOrder: 32,
  },

  // Technical & Execution
  {
    id: 'developer-velocity',
    name: 'Developer Velocity',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Fast build and test loops, modern developer toolchain, and swift PR cycle',
    recommendedOrder: 33,
  },
  {
    id: 'operational-simplicity',
    name: 'Operational Simplicity',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Minimal moving parts, straightforward debugging, and peaceful on-call duties',
    recommendedOrder: 34,
  },
  {
    id: 'system-reliability',
    name: 'System Reliability',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'High uptime SLA, disaster tolerance, zero data loss, and architectural stability',
    recommendedOrder: 35,
  },
  {
    id: 'infrastructure-cost',
    name: 'Infrastructure Cost',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Low monthly server overhead, unit economics efficiency, and lean cloud budget',
    recommendedOrder: 36,
  },
  {
    id: 'time-to-market',
    name: 'Time to Market',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Fastest route to launch, instant user feedback, and competitive speed',
    recommendedOrder: 37,
  },
  {
    id: 'data-privacy-ip',
    name: 'Data Privacy & IP',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Data sovereignty, regulatory compliance (GDPR/HIPAA), and proprietary IP',
    recommendedOrder: 38,
  },
  {
    id: 'maintenance-overhead',
    name: 'Maintenance Overhead',
    category: 'technical',
    categoryLabel: 'Technical & Execution',
    categoryBadgeClass: CATEGORY_DEFINITIONS.technical.badgeClass,
    description: 'Minimal code rot, low dependency upkeep, and self-sustaining architecture',
    recommendedOrder: 39,
  },

  // Strategic & Risk
  {
    id: 'reversibility-low-risk',
    name: 'Reversibility & Low Risk',
    category: 'strategic',
    categoryLabel: 'Strategic & Risk',
    categoryBadgeClass: CATEGORY_DEFINITIONS.strategic.badgeClass,
    description: 'Two-way door decision: effortless to unwind or pivot if hypotheses fail',
    recommendedOrder: 40,
  },
  {
    id: 'regret-minimization',
    name: 'Regret Minimization',
    category: 'strategic',
    categoryLabel: 'Strategic & Risk',
    categoryBadgeClass: CATEGORY_DEFINITIONS.strategic.badgeClass,
    description: 'Minimizing counterfactual regret looking back from an 80-year-old perspective',
    recommendedOrder: 41,
  },
  {
    id: 'opportunity-cost',
    name: 'Opportunity Cost',
    category: 'strategic',
    categoryLabel: 'Strategic & Risk',
    categoryBadgeClass: CATEGORY_DEFINITIONS.strategic.badgeClass,
    description: 'Weighing what valuable alternative opportunities are sacrificed by choosing this path',
    recommendedOrder: 42,
  },
];

// String array of all names for backwards compatibility
export const COMMON_PRIORITIES_LIST: string[] = ALL_SUGGESTED_PRIORITIES.map((p) => p.name);
