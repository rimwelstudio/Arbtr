import { tl } from './translations/tl';
import { ko } from './translations/ko';
import { pt } from './translations/pt';
import { ru } from './translations/ru';
import { it } from './translations/it';
import { hi } from './translations/hi';
import { nl } from './translations/nl';
import { tr } from './translations/tr';
import { pl } from './translations/pl';
import { vi } from './translations/vi';
import { id } from './translations/id';
import { sv } from './translations/sv';
import { da } from './translations/da';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'tl', name: 'Filipino', nativeName: 'Tagalog / Filipino', flag: '🇵🇭' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
];

export type LanguageCode = string;

export interface TranslationDictionary {
  appName: string;
  appSlogan: string;
  appTagline?: string;
  appSubtitle?: string;
  loadingStatus?: string;
  computingVerdictTitle?: string;
  navNewDecision: string;
  navHistory: string;
  navPresets: string;
  navAbout: string;
  navTerms?: string;
  navPrivacy?: string;
  navLanguage: string;
  themeLight?: string;
  themeDark?: string;
  themeToggle?: string;
  
  // Form strings
  formHeading: string;
  formSubheading: string;
  fieldTitleLabel: string;
  fieldTitlePlaceholder: string;
  fieldTitleHelp: string;
  fieldContextLabel: string;
  fieldContextPlaceholder: string;
  fieldContextHelp: string;
  fieldOptionsLabel: string;
  fieldOptionsHelp: string;
  addOptionBtn: string;
  optionPlaceholder: string;
  fieldPrioritiesLabel: string;
  fieldPrioritiesHelp: string;
  addPriorityBtn: string;
  priorityPlaceholder: string;
  targetLanguageLabel: string;
  targetLanguageHelp: string;
  targetLanguageAuto: string;
  breakTheTieBtn: string;
  analyzingBtn: string;
  quickPresetsTitle: string;
  loadPresetBtn: string;

  // Tabs
  tabVerdict: string;
  tabProsCons: string;
  tabMatrix: string;
  tabSwot: string;
  tabSimulator: string;

  // Verdict
  verdictWinningRecommendation: string;
  verdictConfidence: string;
  verdictTiebreakerFactor: string;
  verdictTiebreakerHelp: string;
  verdictCoreReasoning: string;
  verdictRegretCheck: string;
  verdictRegretSubtitle: string;
  verdictGutCheck: string;
  verdictGutSubtitle: string;
  verdictActionPlan: string;
  verdictActionSubtitle: string;
  verdictCriticalRisks: string;
  verdictRisksSubtitle: string;
  verdictStep: string;

  // Actions
  backToInput: string;
  analyzedOn: string;
  copyReport: string;
  copiedToClipboard: string;
  downloadMarkdown: string;
  translateReportBtn: string;
  translateReportTooltip: string;
  translatedBadge: string;
  viewOriginalBtn: string;
  viewTranslatedBtn: string;

  // Pros & Cons
  fitScore: string;
  prosTitle: string;
  consTitle: string;
  addProBtn: string;
  addConBtn: string;
  impactLow: string;
  impactMedium: string;
  impactHigh: string;
  impactCritical: string;
  rationaleLabel: string;
  mitigationLabel: string;
  customBadge: string;

  // Matrix
  matrixSummaryTitle: string;
  matrixCriterionCol: string;
  matrixWeightCol: string;
  matrixLeadingCol: string;
  matrixScoreOutOfTen: string;

  // SWOT
  swotStrengths: string;
  swotWeaknesses: string;
  swotOpportunities: string;
  swotThreats: string;
  swotStrategicImplication: string;

  // Simulator
  simulatorTitle: string;
  simulatorSubtitle: string;
  simulatorInputPlaceholder: string;
  simulatorRunBtn: string;
  simulatorRunningBtn: string;
  simulatorFlipsVerdict: string;
  simulatorReinforces: string;
  simulatorNuance: string;
  simulatorActionableTip: string;
  simulatorPromptChipsTitle: string;

  // Translation Modal
  translateModalTitle: string;
  translateModalDesc: string;
  translateModalSelectLang: string;
  translateModalCustomLang: string;
  translateModalCustomPlaceholder: string;
  translateModalActionBtn: string;
  translateModalTranslating: string;
  translateModalCancel: string;

  // History Drawer
  historyTitle: string;
  historySearchPlaceholder: string;
  historyEmptyTitle: string;
  historyEmptyDesc: string;
  historyLoadBtn: string;
  historyDeleteBtn: string;
  historyClearAllBtn: string;
  historySavedCount: string;

  // Loading steps
  loadingStep1: string;
  loadingStep2: string;
  loadingStep3: string;
  loadingStep4: string;
  loadingStep5: string;

  // Brand, Header & Account
  aiEngineBadge?: string;
  zynoVoiceNav?: string;
  zynoWakeNav?: string;
  zynoNavTitle?: string;
  navAboutTooltip?: string;
  navPresetsTooltip?: string;
  navHistoryTooltip?: string;
  syncingToCloud?: string;
  savedDecisionsCount?: string;
  signOut?: string;
  signIn?: string;
  signInTooltip?: string;

  // Language selector
  appLanguage?: string;
  languagesCount?: string;
  searchLanguagePlaceholder?: string;

  // Decision Form
  formSystemBadge?: string;
  whatIsArbitrLink?: string;
  exploreAllTemplates?: string;
  decisionStructure?: string;
  compareOptions?: string;
  yesNoEvaluation?: string;
  removeOptionTitle?: string;
  activePrioritiesCount?: string;
  activePriorities?: string;
  clearAll?: string;
  noPrioritiesSelected?: string;
  clearSearch?: string;
  priorityAddedFeedback?: string;
  priorityActiveInDecision?: string;
  priorityAvailableSuggestions?: string;
  addAsCustomPriority?: string;
  alreadyActiveInPriorities?: string;
  suggestedPriorities?: string;
  contextIncluded?: string;
  contextOptional?: string;
  hideLabel?: string;
  expandLabel?: string;

  // Action Bar & Guest Banner
  savedToast?: string;
  savedToCloud?: string;
  savedToCloudDesc?: string;
  signInToSave?: string;
  guestBannerText?: string;
  guestMode?: string;
  guestModeSubtitle?: string;

  // Verdict View
  verdictAlignment?: string;
  verdictTalkZynoTitle?: string;
  verdictWakeZyno?: string;
  verdictTalkZynoDesc?: string;
  verdictConsultZyno?: string;
  verdictIntuitivePrompt?: string;
  verdictHideInstinct?: string;
  verdictShowInstinct?: string;
  verdictInstinctExplanation?: string;
  verdictOf?: string;
  verdictDone?: string;
  verdictBannerBadge?: string;
  verdictVoiceHeading?: string;
  liveVoiceWakePrompt?: string;
  verdictVoiceDescription?: string;
  verdictVoiceButton?: string;
  verdictGutPromptLabel?: string;
  gutCheckHide?: string;
  gutCheckInterpret?: string;
  gutCheckExplanation?: string;
  stepsDoneOf?: string;
  stepsDoneLabel?: string;

  // Pros & Cons
  all?: string;
  prosConsAll?: string;
  prosConsMajorOnly?: string;
  prosConsMajorImpactOnly?: string;
  prosConsOverviewFor?: string;
  prosConsAnalysisOverview?: string;
  tabPros?: string;
  tabCons?: string;
  prosConsProsCount?: string;
  prosConsConsCount?: string;
  impactSuffix?: string;
  prosConsImpactSuffix?: string;
  youAdded?: string;
  prosConsYouAdded?: string;
  deleteItem?: string;
  noProsMatch?: string;
  noConsMatch?: string;
  prosConsNoMatches?: string;
  hedgeMitigateTitle?: string;
  mitigationStrategy?: string;
  addCustomPointTitle?: string;
  pointStatementLabel?: string;
  fieldPointStatement?: string;
  categoryLabel?: string;
  fieldCategory?: string;
  impactLevelLabel?: string;
  fieldImpactLevel?: string;
  fieldRationaleOptional?: string;
  fieldMitigationOptional?: string;
  cancelBtn?: string;
  btnCancel?: string;
  savePointBtn?: string;
  btnSavePoint?: string;

  // Comparison Matrix
  matrixSliderTip?: string;
  matrixResetWeights?: string;
  matrixWeightedLeader?: string;
  matrixInteractiveModel?: string;
  matrixScoreMatch?: string;
  matrixLeaderBadge?: string;
  matrixWeightLabel?: string;
  matrixAdvantageBadge?: string;
  comparisonMatrixOverview?: string;
  comparisonMatrixDefaultSummary?: string;
  matrixTip?: string;
  btnResetWeights?: string;
  weightedLeader?: string;
  interactiveModel?: string;
  scoreLabel?: string;
  matchWithPriorities?: string;
  evalCriteriaHeader?: string;
  leaderBadge?: string;
  importanceWeightLabel?: string;
  advantageBadge?: string;

  // SWOT
  noDataFound?: string;
  swotStrategicTitle?: string;
  swotSubtitle?: string;
  swotInternalAdvantages?: string;
  swotInternalDeficits?: string;
  swotExternalTailwinds?: string;
  swotExternalHeadwinds?: string;
  swotExternalRisks?: string;
  swotSynthesisTitle?: string;
  swotSynthesisSubtitle?: string;
  swotStrategicTakeaway?: string;

  // Simulator
  simulatorFactorsSensitive?: string;

  // History Drawer
  historySavedToCloud?: string;
  historySignInToSave?: string;
  historyAuthRequiredDesc?: string;
  historySignInWithGoogleOrEmail?: string;
  historyConfidence?: string;

  // Templates Modal
  templatesModalSubtitle?: string;
  templatesSearchPlaceholder?: string;
  templatesClear?: string;
  templatesNoMatchTitle?: string;
  templatesNoMatchDesc?: string;
  templatesResetFilters?: string;
  templatesCompetingPaths?: string;
  templatesDecisionPriorities?: string;
  templatesLoadIntoForm?: string;
  templatesAnalyze?: string;
  templatesClose?: string;

  // About Modal
  aboutTabOverview?: string;
  aboutTabUseCases?: string;
  aboutTabFramework?: string;
  aboutTabCapabilities?: string;
  aboutCloseBtn?: string;

  // Welcome & Introduction
  welcomeIntroBadge?: string;
  welcomeIntroHeading?: string;
  welcomeIntroSubtitle?: string;
  welcomeHowItWorksTitle?: string;
  welcomeStep1Title?: string;
  welcomeStep1Desc?: string;
  welcomeStep2Title?: string;
  welcomeStep2Desc?: string;
  welcomeStep3Title?: string;
  welcomeStep3Desc?: string;
  welcomeDontShowAgain?: string;
  welcomeStartDeciding?: string;
  welcomeExplorePresets?: string;
  welcomeTalkZyno?: string;
  welcomeBannerNoteTitle?: string;
  welcomeBannerNoteDesc?: string;
  welcomeBannerGuideLink?: string;
  welcomeReopenNav?: string;

  // Auth Modal
  authSignInTitle?: string;
  authSignUpTitle?: string;
  authForgotTitle?: string;
  authForgotDesc?: string;
  authSyncDesc?: string;
  authContinueWithGoogle?: string;
  authContinueWithApple?: string;
  authContinueWithFacebook?: string;
  authOrWithEmail?: string;
  authFullNameLabel?: string;
  authEmailLabel?: string;
  authPasswordLabel?: string;
  authSignInBtn?: string;
  authSignUpBtn?: string;
  authSendResetBtn?: string;
  authAlreadyHaveAccount?: string;
  authNeedAccount?: string;
  authForgotPassword?: string;
  authBackToSignIn?: string;
  authRequired?: string;

  // Live Voice & Wake Word
  liveVoiceTitle?: string;
  liveVoiceSubtitle?: string;
  liveVoiceGrounding?: string;
  liveVoiceVoiceLabel?: string;
  liveVoiceOpenEnded?: string;
  liveVoiceActive?: string;
  liveVoiceSpeaking?: string;
  liveVoiceListening?: string;
  liveVoiceConnecting?: string;
  liveVoiceQuickPrompts?: string;
  liveVoiceTypePlaceholder?: string;
  liveVoiceSend?: string;
  liveVoiceMute?: string;
  liveVoiceUnmute?: string;
  liveVoiceClear?: string;
  liveVoiceCopy?: string;
  liveVoiceEnd?: string;
  liveVoiceClose?: string;
  wakeBannerDetected?: string;
  wakeBannerAwakening?: string;
  wakeBannerEnableMic?: string;
  wakeBannerRequesting?: string;
  wakeBannerTest?: string;
  wakeBannerOff?: string;

  // Insight Feedback Rating
  feedbackPrompt?: string;
  feedbackHelpful?: string;
  feedbackNotHelpful?: string;
  feedbackPositiveNotice?: string;
  feedbackNegativeNotice?: string;
  feedbackTagClear?: string;
  feedbackTagAccurate?: string;
  feedbackTagActionable?: string;
  feedbackTagVague?: string;
  feedbackTagMissingFactors?: string;
  feedbackTagBiased?: string;
  feedbackTagUnrealistic?: string;
  feedbackAddNote?: string;
  feedbackSubmit?: string;
  feedbackThanks?: string;
  feedbackChangeRating?: string;
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    appName: 'Arbitr',
    appSlogan: 'AI Decision Science & Cognitive Arbiter',
    appTagline: 'Stop overthinking. Start deciding.',
    appSubtitle: 'Designed for clarity, cognitive bias reduction, and decisive execution in all languages.',
    loadingStatus: 'Please wait...',
    navNewDecision: 'New Decision',
    navHistory: 'History',
    navPresets: 'Templates',
    navAbout: 'About',
    navTerms: 'Terms & Conditions',
    navPrivacy: 'Privacy Policy',
    navLanguage: 'Language',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeToggle: 'Switch between light and dark mode',

    // Brand, Header & Account
    aiEngineBadge: 'AI Engine',
    zynoVoiceNav: 'Zena Voice',
    zynoWakeNav: 'Wake: "Hey Zena"',
    zynoNavTitle: "Deliberate with Zena • Say 'Hey Zena' anytime or click here",
    navAboutTooltip: 'Learn what Arbitr is used for and how it works',
    navPresetsTooltip: 'Browse sample decisions',
    navHistoryTooltip: 'Saved decision history',
    syncingToCloud: 'Syncing decisions to cloud',
    savedDecisionsCount: 'Saved Decisions',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signInTooltip: 'Sign in to save and sync decisions',

    // Language selector
    appLanguage: 'App Language',
    languagesCount: 'languages',
    searchLanguagePlaceholder: 'Search language...',

    // Decision Form
    formSystemBadge: 'Rational Cognitive Decision System',
    whatIsArbitrLink: 'What is Arbitr & How it works →',
    exploreAllTemplates: 'Explore All Templates',
    decisionStructure: 'Decision Structure',
    compareOptions: 'Compare Options',
    yesNoEvaluation: 'Yes / No Evaluation',
    removeOptionTitle: 'Remove option',
    activePrioritiesCount: 'active',
    activePriorities: 'Active Priorities',
    clearAll: 'Clear all',
    noPrioritiesSelected: 'No priorities selected yet. Pick from the suggestions below or search/type custom values.',
    clearSearch: 'Clear search',
    priorityAddedFeedback: 'Added to active priorities:',
    priorityActiveInDecision: 'Active in Your Decision',
    priorityAvailableSuggestions: 'Available Suggestions',
    addAsCustomPriority: 'Add as custom priority:',
    alreadyActiveInPriorities: 'is already active in your decision priorities above.',
    suggestedPriorities: 'Suggested Priorities:',
    contextIncluded: '(Included)',
    contextOptional: '(Optional, increases accuracy)',
    hideLabel: 'Hide',
    expandLabel: 'Expand',

    // Action Bar & Guest Banner
    savedToast: 'Decision Saved!',
    savedToCloud: 'Saved to Cloud',
    savedToCloudDesc: 'Saved to your Firestore decisions collection.',
    signInToSave: 'Sign in to Save',
    guestBannerText: 'Viewing as guest. Sign in with Google or Email so your decisions are preserved in your account.',
    guestMode: 'Guest Mode',
    guestModeSubtitle: 'Sign in to sync decisions across devices',

    // Verdict View
    verdictAlignment: 'Alignment',
    verdictTalkZynoTitle: 'Talk Through This Verdict with Zena',
    verdictWakeZyno: 'Wake: "Hey Zena"',
    verdictTalkZynoDesc: 'Have a real-time spoken deliberation with Zena to stress-test this verdict or debate trade-offs. Just say "Hey Zena" anytime or click below.',
    verdictConsultZyno: 'Consult Zena',
    verdictIntuitivePrompt: 'Intuitive Prompt:',
    verdictHideInstinct: 'Hide Instinct Interpretation',
    verdictShowInstinct: 'How to interpret your gut reaction?',
    verdictInstinctExplanation: 'If reading this verdict brings a subtle sigh of relief, commit immediately. If it creates persistent inner resistance, that resistance points to an unspoken core value.',
    verdictOf: 'of',
    verdictDone: 'done',
    verdictBannerBadge: 'Definitive Arbiter Verdict',
    verdictVoiceHeading: 'Spoken Deliberation with Zena',
    liveVoiceWakePrompt: 'Wake phrase:',
    verdictVoiceDescription: 'Challenge this verdict, test sensitivities, or ask "what would you do?" in real-time voice.',
    verdictVoiceButton: 'Voice Deliberation',
    verdictGutPromptLabel: 'Intuitive Gut Check',
    gutCheckHide: 'Hide Instinct Interpretation',
    gutCheckInterpret: 'How to interpret your gut reaction?',
    gutCheckExplanation: 'If reading this recommendation gives you subtle relief, commit immediately. If you feel hesitation or resistance, your unstated emotional values favor an alternative.',
    stepsDoneOf: 'of',
    stepsDoneLabel: 'steps completed',

    // Pros & Cons
    all: 'All',
    prosConsAll: 'All Points',
    prosConsMajorOnly: 'Major Impact Only',
    prosConsMajorImpactOnly: 'Major Impact Only',
    prosConsOverviewFor: 'Analysis Overview for',
    prosConsAnalysisOverview: 'Analysis Overview for',
    tabPros: 'Pros',
    tabCons: 'Cons',
    prosConsProsCount: 'Pros',
    prosConsConsCount: 'Cons',
    impactSuffix: 'impact',
    prosConsImpactSuffix: 'impact',
    youAdded: 'You added',
    prosConsYouAdded: 'You added',
    deleteItem: 'Delete item',
    noProsMatch: 'No pros match the current filter.',
    noConsMatch: 'No cons match the current filter.',
    prosConsNoMatches: 'No points match the active filter criteria.',
    hedgeMitigateTitle: 'How to Hedge / Mitigate:',
    mitigationStrategy: 'Hedge / Mitigation Strategy:',
    addCustomPointTitle: 'Add Custom Point',
    pointStatementLabel: 'Point / Statement',
    fieldPointStatement: 'Point / Statement',
    categoryLabel: 'Category',
    fieldCategory: 'Category',
    impactLevelLabel: 'Impact Level',
    fieldImpactLevel: 'Impact Level',
    fieldRationaleOptional: 'Context & Rationale (Optional)',
    fieldMitigationOptional: 'Mitigation Strategy (Optional)',
    cancelBtn: 'Cancel',
    btnCancel: 'Cancel',
    savePointBtn: 'Save Point',
    btnSavePoint: 'Save Point',

    // Comparison Matrix
    matrixSliderTip: 'Tip: Drag importance sliders below to test how personal priorities shift rankings',
    matrixResetWeights: 'Reset Weights',
    matrixWeightedLeader: 'Weighted Leader',
    matrixInteractiveModel: 'Interactive Model',
    matrixScoreMatch: 'match with current priorities',
    matrixLeaderBadge: 'Leader',
    matrixWeightLabel: 'Importance Weight:',
    matrixAdvantageBadge: 'Advantage',
    comparisonMatrixOverview: 'Comparison Matrix Overview',
    comparisonMatrixDefaultSummary: 'Here is how each option stacks up across the primary strategic dimensions.',
    matrixTip: 'Tip: Drag importance sliders below to test how personal priorities shift rankings',
    btnResetWeights: 'Reset Weights',
    weightedLeader: 'Weighted Leader',
    interactiveModel: 'Interactive Model',
    scoreLabel: 'Score:',
    matchWithPriorities: 'match with current priorities',
    evalCriteriaHeader: 'Evaluation Criteria & Priority',
    leaderBadge: 'Leader',
    importanceWeightLabel: 'Importance Weight:',
    advantageBadge: 'Advantage',

    // SWOT
    noDataFound: 'No data available for this path.',
    swotStrategicTitle: 'SWOT Strategic Analysis',
    swotSubtitle: 'Internal factors (Strengths & Weaknesses) vs. External dynamics (Opportunities & Threats)',
    swotInternalAdvantages: 'Internal Advantages',
    swotInternalDeficits: 'Internal Deficits & Friction',
    swotExternalTailwinds: 'External Tailwinds & Upside',
    swotExternalHeadwinds: 'External Headwinds & Vulnerabilities',
    swotExternalRisks: 'External Headwinds & Vulnerabilities',
    swotSynthesisTitle: 'Strategic Synthesis & Implication',
    swotSynthesisSubtitle: 'How to capitalize on advantages while insulating against vulnerabilities',
    swotStrategicTakeaway: 'Strategic Synthesis & Action Plan',

    // Simulator
    simulatorFactorsSensitive: 'Factors Most Sensitive to this Change:',

    // History Drawer
    historySavedToCloud: 'Saved to Arbitr Cloud',
    historySignInToSave: 'Sign in to save decisions',
    historyAuthRequiredDesc: 'Only authenticated users can store decisions in their personal library and access them across devices.',
    historySignInWithGoogleOrEmail: 'Sign in with Google or Email',
    historyConfidence: 'Confidence',

    // Templates Modal
    templatesModalSubtitle: 'Select a real-world case study to immediately populate the framework or run automated arbitration.',
    templatesSearchPlaceholder: 'Search templates by dilemma, keyword, or decision criteria...',
    templatesClear: 'Clear',
    templatesNoMatchTitle: 'No dilemma templates matched your search.',
    templatesNoMatchDesc: 'Try searching with a broader keyword or choose another category.',
    templatesResetFilters: 'Reset filters',
    templatesCompetingPaths: 'Competing Paths:',
    templatesDecisionPriorities: 'Key Decision Priorities:',
    templatesLoadIntoForm: 'Load Into Form',
    templatesAnalyze: 'Analyze',
    templatesClose: 'Close',

    // About Modal
    aboutTabOverview: 'What is Arbitr?',
    aboutTabUseCases: "What It's Used For",
    aboutTabFramework: 'How It Works',
    aboutTabCapabilities: 'Key Capabilities',
    aboutCloseBtn: 'Close',

    // Welcome & Introduction
    welcomeIntroBadge: 'Welcome to Arbitr',
    welcomeIntroHeading: 'Stop Overthinking. Start Deciding.',
    welcomeIntroSubtitle: 'Welcome! Arbitr is your rational AI decision copilot designed to eliminate analysis paralysis, uncover hidden blindspots, and guide you through tough crossroads.',
    welcomeHowItWorksTitle: 'How Arbitr Guides Your Decisions:',
    welcomeStep1Title: '1. Frame the Dilemma',
    welcomeStep1Desc: 'State your choice: compare 2 to 5 competing paths (career moves, tech stacks, investments) or evaluate a single high-stakes Yes/No proposal.',
    welcomeStep2Title: '2. Multi-Perspective Deliberation',
    welcomeStep2Desc: 'Get an instant weighted scoring matrix, rigorous pros & cons with risk mitigations, SWOT analysis, and a decisive final tiebreaker verdict.',
    welcomeStep3Title: '3. Hands-Free Zena Voice',
    welcomeStep3Desc: 'Deliberate verbally in real time. Say "Hey Zena" or tap the voice orb to talk through trade-offs and counter-arguments naturally.',
    welcomeDontShowAgain: "Don't show this intro automatically on launch",
    welcomeStartDeciding: 'Start a Decision',
    welcomeExplorePresets: 'Sample Dilemmas',
    welcomeTalkZyno: 'Talk with Zena',
    welcomeBannerNoteTitle: 'Welcome to Arbitr!',
    welcomeBannerNoteDesc: 'State any crossroad or trade-off you are weighing. Our AI decision science engine will evaluate your options against your values and provide a clear, reasoned verdict.',
    welcomeBannerGuideLink: 'Read Quick Guide',
    welcomeReopenNav: 'Welcome Guide',

    // Auth Modal
    authSignInTitle: 'Sign in to Arbitr',
    authSignUpTitle: 'Create your Account',
    authForgotTitle: 'Reset your Password',
    authForgotDesc: 'We will send a reset link to your email',
    authSyncDesc: 'Access and sync your saved decisions across devices',
    authContinueWithGoogle: 'Continue with Google',
    authContinueWithApple: 'Continue with Apple',
    authContinueWithFacebook: 'Continue with Facebook',
    authOrWithEmail: 'Or with Email',
    authFullNameLabel: 'Full Name (Optional)',
    authEmailLabel: 'Email Address',
    authPasswordLabel: 'Password',
    authSignInBtn: 'Sign In',
    authSignUpBtn: 'Create Account',
    authSendResetBtn: 'Send Password Reset Link',
    authAlreadyHaveAccount: 'Already have an account? Sign in',
    authNeedAccount: "Don't have an account? Create one",
    authForgotPassword: 'Forgot your password?',
    authBackToSignIn: 'Back to Sign In',
    authRequired: 'Authentication Required',

    // Live Voice & Wake Word
    liveVoiceTitle: 'Zena Voice Deliberation',
    liveVoiceSubtitle: 'Interactive sentient particle voice entity powered by Gemini Live API',
    liveVoiceGrounding: 'Grounding:',
    liveVoiceVoiceLabel: 'Voice:',
    liveVoiceOpenEnded: 'Open-ended deliberation mode',
    liveVoiceActive: 'Active',
    liveVoiceSpeaking: 'Gemini Speaking',
    liveVoiceListening: 'Listening to You',
    liveVoiceConnecting: 'Connecting...',
    liveVoiceQuickPrompts: 'Quick Deliberation Prompts:',
    liveVoiceTypePlaceholder: 'Type message to Zena...',
    liveVoiceSend: 'Send',
    liveVoiceMute: 'Mute Microphone',
    liveVoiceUnmute: 'Unmute Microphone',
    liveVoiceClear: 'Clear conversation transcript',
    liveVoiceCopy: 'Copy conversation',
    liveVoiceEnd: 'End Deliberation',
    liveVoiceClose: 'Close voice conversation',
    wakeBannerDetected: 'Wake Word Detected',
    wakeBannerAwakening: 'Awakening Zena for live voice deliberation...',
    wakeBannerEnableMic: 'Enable Mic for Wake Word',
    wakeBannerRequesting: 'Requesting mic...',
    wakeBannerTest: 'Test Wake',
    wakeBannerOff: 'Wake: Off',

    // Insight Feedback Rating
    feedbackPrompt: 'Was this AI insight helpful?',
    feedbackHelpful: 'Helpful',
    feedbackNotHelpful: 'Needs Improvement',
    feedbackPositiveNotice: 'Thank you for your rating! This helps improve future recommendations.',
    feedbackNegativeNotice: 'Thanks for letting us know. What could be improved?',
    feedbackTagClear: 'Clear rationale',
    feedbackTagAccurate: 'Accurate trade-offs',
    feedbackTagActionable: 'Actionable advice',
    feedbackTagVague: 'Too vague or generic',
    feedbackTagMissingFactors: 'Missed important factors',
    feedbackTagBiased: 'Biased recommendation',
    feedbackTagUnrealistic: 'Unrealistic assumptions',
    feedbackAddNote: 'Add an optional note...',
    feedbackSubmit: 'Submit Feedback',
    feedbackThanks: 'Feedback saved',
    feedbackChangeRating: 'Change rating',
    
    formHeading: 'Break Your Decision Paralysis',
    formSubheading: 'Input candidate options, context, and core priorities. Arbitr applies multi-criteria trade-off modeling, 4-quadrant SWOT, and regret minimization to deliver a clear recommendation.',
    fieldTitleLabel: 'What decision are you trying to resolve?',
    fieldTitlePlaceholder: 'e.g. Accept Senior Offer at Tech Startup vs Stay at Established Enterprise',
    fieldTitleHelp: 'Phrase it as a question or comparison between your paths.',
    fieldContextLabel: 'Background Context & Constraints (Optional)',
    fieldContextPlaceholder: 'Mention family considerations, financial safety margins, risk tolerance, timeline, or non-negotiables...',
    fieldContextHelp: 'Providing real constraints produces vastly sharper strategic reasoning.',
    fieldOptionsLabel: 'Options under consideration',
    fieldOptionsHelp: 'Compare 2 to 5 distinct paths.',
    addOptionBtn: '+ Add Option',
    optionPlaceholder: 'Option',
    fieldPrioritiesLabel: 'Core Priorities & Values (What matters most to you?)',
    fieldPrioritiesHelp: 'Helps the AI score each option according to your values.',
    addPriorityBtn: '+ Add Priority',
    priorityPlaceholder: 'e.g. Work-life balance, Long-term wealth, Intellectual growth',
    targetLanguageLabel: 'Analysis Output Language',
    targetLanguageHelp: 'The AI will generate the entire report in your chosen language.',
    targetLanguageAuto: 'Match Interface Language / Input',
    breakTheTieBtn: 'Break the Tie with AI',
    analyzingBtn: 'Evaluating Trade-offs...',
    quickPresetsTitle: 'Or explore a classic dilemma template:',
    loadPresetBtn: 'Load Template',

    tabVerdict: 'Decisive Verdict',
    tabProsCons: 'Pros & Cons',
    tabMatrix: 'Trade-off Matrix',
    tabSwot: '4-Quadrant SWOT',
    tabSimulator: 'What-If Simulator',

    verdictWinningRecommendation: 'Decisive Recommendation',
    verdictConfidence: 'Confidence Index',
    verdictTiebreakerFactor: 'The Tiebreaker Pivot Point',
    verdictTiebreakerHelp: 'The single decisive factor that breaks deadlock between your options.',
    verdictCoreReasoning: 'Strategic Synthesis & Rationale',
    verdictRegretCheck: 'Regret Minimization Test (10/10/10 Perspective)',
    verdictRegretSubtitle: 'How will you look back on this in 10 minutes, 10 months, and 10 years?',
    verdictGutCheck: 'Intuition Gut Check',
    verdictGutSubtitle: 'A diagnostic question to test your subconscious certainty.',
    verdictActionPlan: 'Action Commitment Plan',
    verdictActionSubtitle: 'Immediate, low-friction steps to execute this decision with zero second-guessing.',
    verdictCriticalRisks: 'Critical Risks to Monitor',
    verdictRisksSubtitle: 'Key failure modes to guard against once committed.',
    verdictStep: 'Step',

    backToInput: 'Edit Input',
    analyzedOn: 'Analyzed on',
    copyReport: 'Copy Report',
    copiedToClipboard: 'Copied Markdown to Clipboard!',
    downloadMarkdown: 'Export Markdown',
    translateReportBtn: 'Translate Report',
    translateReportTooltip: 'Translate this entire decision analysis into any language with AI',
    translatedBadge: 'Translated to',
    viewOriginalBtn: 'View Original',
    viewTranslatedBtn: 'View Translated',

    fitScore: 'Overall Fit Score',
    prosTitle: 'Compounding Advantages (Pros)',
    consTitle: 'Liabilities & Downsides (Cons)',
    addProBtn: '+ Add Custom Pro',
    addConBtn: '+ Add Custom Con',
    impactLow: 'Low Impact',
    impactMedium: 'Medium Impact',
    impactHigh: 'High Impact',
    impactCritical: 'Critical Pivot',
    rationaleLabel: 'Rationale',
    mitigationLabel: 'Suggested Mitigation',
    customBadge: 'User Added',

    matrixSummaryTitle: 'Multi-Criteria Scoring Summary',
    matrixCriterionCol: 'Evaluation Dimension',
    matrixWeightCol: 'Weight',
    matrixLeadingCol: 'Leading Choice',
    matrixScoreOutOfTen: '/10',

    swotStrengths: 'Strengths (Internal Advantages)',
    swotWeaknesses: 'Weaknesses (Internal Deficits)',
    swotOpportunities: 'Opportunities (External Tailwinds)',
    swotThreats: 'Threats (External Headwinds)',
    swotStrategicImplication: 'Strategic Takeaway',

    simulatorTitle: 'Scenario & What-If Stress Tester',
    simulatorSubtitle: 'Test hypothetical shifts in conditions. See if new data or unexpected turns flip the recommendation.',
    simulatorInputPlaceholder: 'What if interest rates drop by 2% next quarter? What if I get promoted in 6 months?',
    simulatorRunBtn: 'Simulate Scenario',
    simulatorRunningBtn: 'Simulating Dynamics...',
    simulatorFlipsVerdict: 'Flips Recommended Verdict!',
    simulatorReinforces: 'Reinforces Original Verdict',
    simulatorNuance: 'Adds Nuance (No Flip)',
    simulatorActionableTip: 'Empirical Test Before Committing',
    simulatorPromptChipsTitle: 'Try a prompt test:',

    translateModalTitle: 'Translate Decision Analysis',
    translateModalDesc: 'Translate every nuance, SWOT quadrant, criteria breakdown, and action step into any language using Gemini AI.',
    translateModalSelectLang: 'Choose Target Language',
    translateModalCustomLang: 'Or specify another language:',
    translateModalCustomPlaceholder: 'e.g. Swahili, Greek, Catalan, Thai, Ukrainian...',
    translateModalActionBtn: 'Translate Full Report',
    translateModalTranslating: 'Translating with Gemini AI...',
    translateModalCancel: 'Cancel',

    historyTitle: 'Past Decisions',
    historySearchPlaceholder: 'Search past decisions...',
    historyEmptyTitle: 'No saved decisions yet.',
    historyEmptyDesc: 'No saved decisions yet. Run your first Arbitr analysis to start building your history.',
    historyLoadBtn: 'Open Breakdown',
    historyDeleteBtn: 'Delete',
    historyClearAllBtn: 'Clear History',
    historySavedCount: 'saved',

    loadingStep1: 'Cataloging multi-dimensional trade-offs & hidden costs...',
    loadingStep2: 'Formulating weighted multi-criteria comparison matrix...',
    loadingStep3: 'Synthesizing 4-quadrant SWOT dimensions across paths...',
    loadingStep4: 'Applying Bezos regret minimization & tiebreaker logic...',
    loadingStep5: 'Finalizing decisive verdict and immediate action plan...',
  },

  es: {
    appName: 'Arbitr',
    appSlogan: 'Ciencia de Decisiones con IA & Árbitro Cognitivo',
    navNewDecision: 'Nueva Decisión',
    navHistory: 'Historial',
    navPresets: 'Plantillas',
    navAbout: 'Acerca de',
    navTerms: 'Términos y Condiciones',
    navPrivacy: 'Política de Privacidad',
    navLanguage: 'Idioma',

    formHeading: 'Rompe la Parálisis por Análisis',
    formSubheading: 'Ingresa opciones, contexto y prioridades. Arbitr aplica modelos de compensación multicriterio, FODA en 4 cuadrantes y minimización de arrepentimiento para recomendarte el mejor camino.',
    fieldTitleLabel: '¿Qué decisión estás intentando resolver?',
    fieldTitlePlaceholder: 'ej. Aceptar oferta en Startup vs Quedarse en Empresa Establecida',
    fieldTitleHelp: 'Plantéalo como una pregunta o comparación entre tus alternativas.',
    fieldContextLabel: 'Contexto y Restricciones (Opcional)',
    fieldContextPlaceholder: 'Menciona consideraciones familiares, margen financiero, tolerancia al riesgo o factores innegociables...',
    fieldContextHelp: 'Aportar restricciones reales genera razonamientos estratégicos mucho más precisos.',
    fieldOptionsLabel: 'Opciones bajo consideración',
    fieldOptionsHelp: 'Compara entre 2 y 5 caminos distintos.',
    addOptionBtn: '+ Agregar Opción',
    optionPlaceholder: 'Opción',
    fieldPrioritiesLabel: 'Prioridades Clave y Valores (¿Qué es lo más importante?)',
    fieldPrioritiesHelp: 'Ayuda a la IA a calificar cada opción según lo que más valoras.',
    addPriorityBtn: '+ Agregar Prioridad',
    priorityPlaceholder: 'ej. Equilibrio de vida, Patrimonio a largo plazo, Crecimiento profesional',
    targetLanguageLabel: 'Idioma del Análisis',
    targetLanguageHelp: 'La IA generará el informe completo en el idioma seleccionado.',
    targetLanguageAuto: 'Mismo idioma de la interfaz / entrada',
    breakTheTieBtn: 'Romper el Empate con IA',
    analyzingBtn: 'Evaluando Opciones...',
    quickPresetsTitle: 'O prueba una plantilla clásica de dilema:',
    loadPresetBtn: 'Cargar Plantilla',

    tabVerdict: 'Veredicto Decisivo',
    tabProsCons: 'Pros y Contras',
    tabMatrix: 'Matriz de Criterios',
    tabSwot: 'FODA 4 Cuadrantes',
    tabSimulator: 'Simulador "¿Qué Pasa Si?"',

    verdictWinningRecommendation: 'Recomendación Decisiva',
    verdictConfidence: 'Índice de Confianza',
    verdictTiebreakerFactor: 'El Factor Desempatador Clave',
    verdictTiebreakerHelp: 'El punto decisivo e intransigente que rompe el bloqueo entre tus opciones.',
    verdictCoreReasoning: 'Síntesis y Fundamentación Estratégica',
    verdictRegretCheck: 'Test de Minimización de Arrepentimiento (Perspectiva 10/10/10)',
    verdictRegretSubtitle: '¿Cómo verás esta decisión en 10 minutos, 10 meses y 10 años?',
    verdictGutCheck: 'Chequeo Intuitivo',
    verdictGutSubtitle: 'Una pregunta diagnóstica para poner a prueba tu certeza interior.',
    verdictActionPlan: 'Plan de Acción Inmediato',
    verdictActionSubtitle: 'Pasos secuenciales para comprometerte con esta elección sin dudar.',
    verdictCriticalRisks: 'Riesgos Críticos a Vigilar',
    verdictRisksSubtitle: 'Puntos débiles a monitorear una vez tomada la decisión.',
    verdictStep: 'Paso',

    backToInput: 'Editar Datos',
    analyzedOn: 'Analizado el',
    copyReport: 'Copiar Informe',
    copiedToClipboard: '¡Informe Markdown copiado al portapapeles!',
    downloadMarkdown: 'Exportar Markdown',
    translateReportBtn: 'Traducir Informe',
    translateReportTooltip: 'Traduce todo este análisis a cualquier idioma con IA',
    translatedBadge: 'Traducido a',
    viewOriginalBtn: 'Ver Original',
    viewTranslatedBtn: 'Ver Traducido',

    fitScore: 'Puntuación de Ajuste General',
    prosTitle: 'Ventajas Acumulativas (Pros)',
    consTitle: 'Riesgos y Desventajas (Contras)',
    addProBtn: '+ Agregar Pro Personalizado',
    addConBtn: '+ Agregar Contra Personalizado',
    impactLow: 'Impacto Bajo',
    impactMedium: 'Impacto Medio',
    impactHigh: 'Impacto Alto',
    impactCritical: 'Factor Crítico',
    rationaleLabel: 'Justificación',
    mitigationLabel: 'Mitigación Sugerida',
    customBadge: 'Añadido por Usuario',

    matrixSummaryTitle: 'Resumen de Puntuación Multicriterio',
    matrixCriterionCol: 'Dimensión de Evaluación',
    matrixWeightCol: 'Peso',
    matrixLeadingCol: 'Opción Líder',
    matrixScoreOutOfTen: '/10',

    swotStrengths: 'Fortalezas (Ventajas Internas)',
    swotWeaknesses: 'Debilidades (Déficits Internos)',
    swotOpportunities: 'Oportunidades (Viento a Favor Externo)',
    swotThreats: 'Amenazas (Riesgos Externos)',
    swotStrategicImplication: 'Conclusión Estratégica',

    simulatorTitle: 'Simulador de Escenarios "¿Qué Pasa Si?"',
    simulatorSubtitle: 'Evalúa giros hipotéticos y condiciones cambiantes para ver si el veredicto cambia.',
    simulatorInputPlaceholder: '¿Qué pasa si los tipos de interés caen un 2%? ¿Qué pasa si me ascienden en 6 meses?',
    simulatorRunBtn: 'Simular Escenario',
    simulatorRunningBtn: 'Simulando Escenario...',
    simulatorFlipsVerdict: '¡Cambia la Opción Ganadora!',
    simulatorReinforces: 'Refuerza la Recomendación Original',
    simulatorNuance: 'Añade Matices (Sin Cambio de Opción)',
    simulatorActionableTip: 'Prueba Práctica antes de Comprometerte',
    simulatorPromptChipsTitle: 'Prueba una pregunta rápida:',

    translateModalTitle: 'Traducir Análisis de Decisión',
    translateModalDesc: 'Traduce cada matiz, FODA, criterios y pasos de acción a cualquier idioma con Gemini IA.',
    translateModalSelectLang: 'Elige Idioma de Destino',
    translateModalCustomLang: 'O especifica otro idioma:',
    translateModalCustomPlaceholder: 'ej. Catalán, Griego, Tailandés, Sueco, Vasco...',
    translateModalActionBtn: 'Traducir Informe Completo',
    translateModalTranslating: 'Traduciendo con Gemini IA...',
    translateModalCancel: 'Cancelar',

    historyTitle: 'Decisiones Guardadas',
    historySearchPlaceholder: 'Buscar por título u opción...',
    historyEmptyTitle: 'Aún no hay decisiones guardadas',
    historyEmptyDesc: 'Los análisis que realices se guardan automáticamente en tu navegador.',
    historyLoadBtn: 'Abrir Análisis',
    historyDeleteBtn: 'Eliminar',
    historyClearAllBtn: 'Borrar Todo',
    historySavedCount: 'guardadas',

    loadingStep1: 'Catalogando compensaciones y costos ocultos...',
    loadingStep2: 'Formulando matriz ponderada multicriterio...',
    loadingStep3: 'Sintetizando dimensiones FODA de 4 cuadrantes...',
    loadingStep4: 'Aplicando minimización de arrepentimiento de Bezos...',
    loadingStep5: 'Finalizando veredicto decisivo y plan de acción...',

    // Brand, Header & Account
    aiEngineBadge: 'Motor IA',
    zynoVoiceNav: 'Voz Zena',
    zynoWakeNav: 'Activación: "Hey Zena"',
    zynoNavTitle: 'Delibera con Zena • Di "Hey Zena" o pulsa aquí',
    navAboutTooltip: 'Aprende qué es Arbitr y cómo funciona',
    navPresetsTooltip: 'Explora decisiones de ejemplo',
    navHistoryTooltip: 'Historial de decisiones guardadas',
    syncingToCloud: 'Sincronizando con la nube',
    savedDecisionsCount: 'Decisiones Guardadas',
    signOut: 'Cerrar Sesión',
    signIn: 'Iniciar Sesión',
    signInTooltip: 'Inicia sesión para guardar y sincronizar',

    // Language selector
    appLanguage: 'Idioma de la App',
    languagesCount: 'idiomas',
    searchLanguagePlaceholder: 'Buscar idioma...',

    // Decision Form
    formSystemBadge: 'Sistema Racional de Decisiones Cognitivas',
    whatIsArbitrLink: 'Qué es Arbitr y cómo funciona →',
    exploreAllTemplates: 'Explorar Todas las Plantillas',
    decisionStructure: 'Estructura de la Decisión',
    compareOptions: 'Comparar Opciones',
    yesNoEvaluation: 'Evaluación Sí / No',
    removeOptionTitle: 'Eliminar opción',
    activePrioritiesCount: 'activas',
    activePriorities: 'Prioridades Activas',
    clearAll: 'Borrar todo',
    noPrioritiesSelected: 'Aún no hay prioridades seleccionadas. Elige sugerencias abajo o busca valores.',
    clearSearch: 'Borrar búsqueda',
    priorityAddedFeedback: 'Agregado a prioridades activas:',
    priorityActiveInDecision: 'Activo en tu Decisión',
    priorityAvailableSuggestions: 'Sugerencias Disponibles',
    addAsCustomPriority: 'Agregar como prioridad personalizada:',
    alreadyActiveInPriorities: 'ya está activa en tus prioridades arriba.',
    suggestedPriorities: 'Prioridades Sugeridas:',
    contextIncluded: '(Incluido)',
    contextOptional: '(Opcional, aumenta la precisión)',
    hideLabel: 'Ocultar',
    expandLabel: 'Expandir',

    // Action Bar & Guest Banner
    savedToast: '¡Guardado!',
    savedToCloud: 'Guardado en la Nube',
    signInToSave: 'Inicia Sesión para Guardar',
    guestBannerText: 'Viendo como invitado. Inicia sesión con Google o Correo para preservar tus decisiones en tu cuenta.',

    // Verdict View
    verdictAlignment: 'Alineación',
    verdictTalkZynoTitle: 'Delibera este Veredicto con Zena',
    verdictWakeZyno: 'Activación: "Hey Zena"',
    verdictTalkZynoDesc: 'Ten una deliberación en tiempo real por voz con Zena para poner a prueba este veredicto.',
    verdictConsultZyno: 'Consultar a Zena',
    verdictIntuitivePrompt: 'Pregunta Intuitiva:',
    verdictHideInstinct: 'Ocultar Interpretación del Instinto',
    verdictShowInstinct: '¿Cómo interpretar tu reacción visceral?',
    verdictInstinctExplanation: 'Si leer este veredicto te produce alivio, comprométete de inmediato. Si provoca resistencia interna, esa resistencia señala un valor esencial no expresado.',
    verdictOf: 'de',
    verdictDone: 'completados',

    // Pros & Cons
    all: 'Todos',
    prosConsMajorImpactOnly: 'Solo Impacto Mayor',
    prosConsOverviewFor: 'Resumen de Análisis para',
    prosConsProsCount: 'Pros',
    prosConsConsCount: 'Contras',
    impactSuffix: 'impacto',
    youAdded: 'Agregado por ti',
    deleteItem: 'Eliminar elemento',
    noProsMatch: 'Ningún pro coincide con el filtro actual.',
    noConsMatch: 'Ningún contra coincide con el filtro actual.',
    hedgeMitigateTitle: 'Cómo Mitigar / Protegerse:',
    addCustomPointTitle: 'Agregar Punto Personalizado',
    pointStatementLabel: 'Punto / Declaración',
    categoryLabel: 'Categoría',
    impactLevelLabel: 'Nivel de Impacto',
    cancelBtn: 'Cancelar',
    savePointBtn: 'Guardar Punto',

    // Comparison Matrix
    matrixSliderTip: 'Consejo: Arrastra los controles de importancia para ver cómo cambian las posiciones',
    matrixResetWeights: 'Restablecer Pesos',
    matrixWeightedLeader: 'Líder Ponderado',
    matrixInteractiveModel: 'Modelo Interactivo',
    matrixScoreMatch: 'coincidencia con prioridades actuales',
    matrixLeaderBadge: 'Líder',
    matrixWeightLabel: 'Peso de Importancia:',
    matrixAdvantageBadge: 'Ventaja',

    // SWOT
    swotStrategicTitle: 'Análisis Estratégico FODA',
    swotSubtitle: 'Factores internos (Fortalezas y Debilidades) vs. Dinámicas externas (Oportunidades y Amenazas)',
    swotInternalAdvantages: 'Ventajas Internas',
    swotInternalDeficits: 'Déficits Internos y Fricción',
    swotExternalTailwinds: 'Vientos a Favor y Potencial Externo',
    swotExternalHeadwinds: 'Vientos en Contra y Vulnerabilidades',
    swotSynthesisTitle: 'Síntesis Estratégica e Implicación',
    swotSynthesisSubtitle: 'Cómo capitalizar ventajas mientras te blindas ante vulnerabilidades',

    // Simulator
    simulatorFactorsSensitive: 'Factores Más Sensibles a este Cambio:',

    // History Drawer
    historySavedToCloud: 'Guardado en la Nube de Arbitr',
    historySignInToSave: 'Inicia sesión para guardar decisiones',
    historyAuthRequiredDesc: 'Solo los usuarios autenticados pueden guardar decisiones en su biblioteca personal.',
    historySignInWithGoogleOrEmail: 'Inicia sesión con Google o Correo',
    historyConfidence: 'Confianza',

    // Templates Modal
    templatesModalSubtitle: 'Selecciona un caso real para rellenar el marco o ejecutar un arbitraje automatizado.',
    templatesSearchPlaceholder: 'Buscar plantillas por dilema, palabra clave o criterios...',
    templatesClear: 'Limpiar',
    templatesNoMatchTitle: 'Ninguna plantilla coincide con tu búsqueda.',
    templatesNoMatchDesc: 'Intenta con una palabra clave más amplia o selecciona otra categoría.',
    templatesResetFilters: 'Restablecer filtros',
    templatesCompetingPaths: 'Caminos en Competencia:',
    templatesDecisionPriorities: 'Prioridades Clave de Decisión:',
    templatesLoadIntoForm: 'Cargar en Formulario',
    templatesAnalyze: 'Analizar',
    templatesClose: 'Cerrar',

    // About Modal
    aboutTabOverview: '¿Qué es Arbitr?',
    aboutTabUseCases: 'Para qué se Utiliza',
    aboutTabFramework: 'Cómo Funciona',
    aboutTabCapabilities: 'Capacidades Clave',
    aboutCloseBtn: 'Cerrar',

    // Auth Modal
    authSignInTitle: 'Iniciar Sesión en Arbitr',
    authSignUpTitle: 'Crea tu Cuenta',
    authForgotTitle: 'Restablece tu Contraseña',
    authForgotDesc: 'Te enviaremos un enlace de recuperación a tu correo',
    authSyncDesc: 'Accede y sincroniza tus decisiones guardadas entre dispositivos',
    authContinueWithGoogle: 'Continuar con Google',
    authContinueWithApple: 'Continuar con Apple',
    authContinueWithFacebook: 'Continuar con Facebook',
    authOrWithEmail: 'O con Correo Electrónico',
    authFullNameLabel: 'Nombre Completo (Opcional)',
    authEmailLabel: 'Correo Electrónico',
    authPasswordLabel: 'Contraseña',
    authSignInBtn: 'Iniciar Sesión',
    authSignUpBtn: 'Crear Cuenta',
    authSendResetBtn: 'Enviar Enlace de Recuperación',
    authAlreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
    authNeedAccount: '¿No tienes cuenta? Regístrate',
    authForgotPassword: '¿Olvidaste tu contraseña?',
    authBackToSignIn: 'Volver a Iniciar Sesión',
    authRequired: 'Autenticación Requerida',

    // Live Voice & Wake Word
    liveVoiceTitle: 'Deliberación por Voz Zena',
    liveVoiceSubtitle: 'Entidad de voz interactiva impulsada por Gemini Live API',
    liveVoiceGrounding: 'Fundamentación:',
    liveVoiceVoiceLabel: 'Voz:',
    liveVoiceOpenEnded: 'Modo deliberación abierta',
    liveVoiceActive: 'Activo',
    liveVoiceSpeaking: 'Gemini Hablando',
    liveVoiceListening: 'Escuchándote',
    liveVoiceConnecting: 'Conectando...',
    liveVoiceQuickPrompts: 'Preguntas Rápidas de Deliberación:',
    liveVoiceTypePlaceholder: 'Escribe un mensaje para Zena...',
    liveVoiceSend: 'Enviar',
    liveVoiceMute: 'Silenciar Micrófono',
    liveVoiceUnmute: 'Activar Micrófono',
    liveVoiceClear: 'Limpiar transcripción',
    liveVoiceCopy: 'Copiar conversación',
    liveVoiceEnd: 'Finalizar Deliberación',
    liveVoiceClose: 'Cerrar conversación de voz',
    wakeBannerDetected: 'Palabra de Activación Detectada',
    wakeBannerAwakening: 'Despertando a Zena para deliberación por voz...',
    wakeBannerEnableMic: 'Habilitar Micrófono para Activación',
    wakeBannerRequesting: 'Solicitando micrófono...',
    wakeBannerTest: 'Probar Activación',
    wakeBannerOff: 'Activación: Apagada',

    // Insight Feedback Rating
    feedbackPrompt: '¿Te resultó útil este análisis de IA?',
    feedbackHelpful: 'Útil',
    feedbackNotHelpful: 'Necesita Mejorar',
    feedbackPositiveNotice: '¡Gracias por calificar! Esto ayuda a mejorar las recomendaciones.',
    feedbackNegativeNotice: 'Gracias por informarnos. ¿Cómo podemos mejorarlo?',
    feedbackTagClear: 'Razonamiento claro',
    feedbackTagAccurate: 'Compensaciones precisas',
    feedbackTagActionable: 'Consejos prácticos',
    feedbackTagVague: 'Demasiado vago o genérico',
    feedbackTagMissingFactors: 'Omitió factores importantes',
    feedbackTagBiased: 'Recomendación sesgada',
    feedbackTagUnrealistic: 'Supuestos poco realistas',
    feedbackAddNote: 'Agrega una nota opcional...',
    feedbackSubmit: 'Enviar Comentarios',
    feedbackThanks: 'Comentarios guardados',
    feedbackChangeRating: 'Cambiar calificación',
  },

  fr: {
    appName: 'Arbitr',
    appSlogan: 'Science Décisionnelle IA & Arbitre Cognitif',
    navNewDecision: 'Nouvelle Décision',
    navHistory: 'Historique',
    navPresets: 'Modèles',
    navAbout: 'À propos',
    navTerms: 'Conditions Générales',
    navPrivacy: 'Politique de Confidentialité',
    navLanguage: 'Langue',

    formHeading: 'Surmontez la Paralysie Décisionnelle',
    formSubheading: 'Saisissez vos options, votre contexte et vos priorités. Arbitr applique des modèles multicritères, un SWOT à 4 quadrants et la minimisation des regrets pour une recommandation claire.',
    fieldTitleLabel: 'Quelle décision cherchez-vous à trancher ?',
    fieldTitlePlaceholder: 'ex. Rejoindre une Startup Tech vs Rester dans une Grande Entreprise',
    fieldTitleHelp: 'Formulez votre dilemme sous forme de question ou de comparaison.',
    fieldContextLabel: 'Contexte et Contraintes (Optionnel)',
    fieldContextPlaceholder: 'Mentionnez votre situation financière, vos critères familiaux, votre tolérance au risque...',
    fieldContextHelp: 'Fournir des contraintes réelles affine grandement le raisonnement stratégique.',
    fieldOptionsLabel: 'Options envisagées',
    fieldOptionsHelp: 'Comparez entre 2 et 5 voies possibles.',
    addOptionBtn: '+ Ajouter une Option',
    optionPlaceholder: 'Option',
    fieldPrioritiesLabel: 'Priorités et Valeurs Essentielles',
    fieldPrioritiesHelp: 'Permet à l’IA d’évaluer chaque option selon ce qui compte le plus pour vous.',
    addPriorityBtn: '+ Ajouter une Priorité',
    priorityPlaceholder: 'ex. Équilibre de vie, Sécurité financière, Épanouissement intellectuel',
    targetLanguageLabel: 'Langue du Rapport',
    targetLanguageHelp: 'L’IA rédigera l’intégralité de l’analyse dans la langue choisie.',
    targetLanguageAuto: 'Même langue que l’interface / saisie',
    breakTheTieBtn: 'Trancher avec l’IA',
    analyzingBtn: 'Évaluation des Options...',
    quickPresetsTitle: 'Ou explorez un modèle classique de dilemme :',
    loadPresetBtn: 'Charger le Modèle',

    tabVerdict: 'Verdict Décisif',
    tabProsCons: 'Pour & Contre',
    tabMatrix: 'Matrice d’Arbitrage',
    tabSwot: 'SWOT 4 Quadrants',
    tabSimulator: 'Simulateur "Et Si ?"',

    verdictWinningRecommendation: 'Recommandation Décisive',
    verdictConfidence: 'Indice de Confiance',
    verdictTiebreakerFactor: 'Le Facteur Pivot Déterminant',
    verdictTiebreakerHelp: 'L’élément clé et sans compromis qui tranche l’égalité entre vos options.',
    verdictCoreReasoning: 'Synthèse et Argumentation Stratégique',
    verdictRegretCheck: 'Test de Minimisation des Regrets (Perspective 10/10/10)',
    verdictRegretSubtitle: 'Quel regard porterez-vous sur ce choix dans 10 minutes, 10 mois et 10 ans ?',
    verdictGutCheck: 'Test Intuitif',
    verdictGutSubtitle: 'Une question révélatrice pour interroger votre conviction profonde.',
    verdictActionPlan: 'Plan d’Action Immédiat',
    verdictActionSubtitle: 'Étapes concrètes pour vous engager dans ce choix avec sérénité.',
    verdictCriticalRisks: 'Risques Critiques à Surveiller',
    verdictRisksSubtitle: 'Points de vigilance essentiels après avoir tranché.',
    verdictStep: 'Étape',

    backToInput: 'Modifier la Saisie',
    analyzedOn: 'Analysé le',
    copyReport: 'Copier le Rapport',
    copiedToClipboard: 'Rapport Markdown copié dans le presse-papiers !',
    downloadMarkdown: 'Exporter en Markdown',
    translateReportBtn: 'Traduire le Rapport',
    translateReportTooltip: 'Traduisez cette analyse dans n’importe quelle langue grâce à l’IA',
    translatedBadge: 'Traduit en',
    viewOriginalBtn: 'Voir Original',
    viewTranslatedBtn: 'Voir Traduit',

    fitScore: 'Score d’Adéquation Global',
    prosTitle: 'Avantages Déterminants (Pour)',
    consTitle: 'Inconvénients & Risques (Contre)',
    addProBtn: '+ Ajouter un Pour Personnalisé',
    addConBtn: '+ Ajouter un Contre Personnalisé',
    impactLow: 'Impact Faible',
    impactMedium: 'Impact Moyen',
    impactHigh: 'Impact Élevé',
    impactCritical: 'Impact Critique',
    rationaleLabel: 'Explication',
    mitigationLabel: 'Atténuation Proposée',
    customBadge: 'Ajouté par Vous',

    matrixSummaryTitle: 'Synthèse Multicritère Pondérée',
    matrixCriterionCol: 'Critère d’Évaluation',
    matrixWeightCol: 'Poids',
    matrixLeadingCol: 'Option Gagnante',
    matrixScoreOutOfTen: '/10',

    swotStrengths: 'Forces (Atouts Internes)',
    swotWeaknesses: 'Faiblesses (Limites Internes)',
    swotOpportunities: 'Opportunités (Leviers Externes)',
    swotThreats: 'Menaces (Risques Externes)',
    swotStrategicImplication: 'Enseignement Stratégique',

    simulatorTitle: 'Simulateur de Scénarios "Et Si ?"',
    simulatorSubtitle: 'Testez des changements d’hypothèses pour vérifier si la recommandation change.',
    simulatorInputPlaceholder: 'Et si le marché se retourne l’année prochaine ? Et si je négocie 20% de plus ?',
    simulatorRunBtn: 'Simuler le Scénario',
    simulatorRunningBtn: 'Simulation en cours...',
    simulatorFlipsVerdict: 'Bascule le Choix Recommandé !',
    simulatorReinforces: 'Renforce la Recommandation',
    simulatorNuance: 'Apporte de la Nuance (Sans Inversion)',
    simulatorActionableTip: 'Test Pratique avant Engagement',
    simulatorPromptChipsTitle: 'Exemples de scénarios rapides :',

    translateModalTitle: 'Traduire l’Analyse Décisionnelle',
    translateModalDesc: 'Traduisez chaque nuance, le SWOT et le plan d’action dans la langue de votre choix grâce à Gemini IA.',
    translateModalSelectLang: 'Choisir la Langue Cible',
    translateModalCustomLang: 'Ou précisez une autre langue :',
    translateModalCustomPlaceholder: 'ex. Grec, Catalan, Thaï, Arabe, Polonais...',
    translateModalActionBtn: 'Traduire le Rapport',
    translateModalTranslating: 'Traduction avec Gemini IA...',
    translateModalCancel: 'Annuler',

    historyTitle: 'Analyses Sauvegardées',
    historySearchPlaceholder: 'Rechercher par titre ou option...',
    historyEmptyTitle: 'Aucune décision enregistrée',
    historyEmptyDesc: 'Vos analyses sont conservées localement dans votre navigateur.',
    historyLoadBtn: 'Ouvrir l’Analyse',
    historyDeleteBtn: 'Supprimer',
    historyClearAllBtn: 'Tout Effacer',
    historySavedCount: 'enregistrées',

    loadingStep1: 'Recensement des compromis et coûts masqués...',
    loadingStep2: 'Modélisation de la matrice multicritère...',
    loadingStep3: 'Synthèse des 4 quadrants SWOT...',
    loadingStep4: 'Application de la minimisation des regrets de Bezos...',
    loadingStep5: 'Finalisation du verdict et du plan d’action...',
  },

  de: {
    appName: 'Arbitr',
    appSlogan: 'KI-Entscheidungsanalyse & Kognitiver Schlichter',
    navNewDecision: 'Neue Entscheidung',
    navHistory: 'Verlauf',
    navPresets: 'Vorlagen',
    navAbout: 'Über Arbitr',
    navTerms: 'Nutzungsbedingungen',
    navPrivacy: 'Datenschutzerklärung',
    navLanguage: 'Sprache',

    formHeading: 'Überwinden Sie Entscheidungsblockaden',
    formSubheading: 'Geben Sie Optionen, Kontext und Prioritäten ein. Arbitr wendet Kriterien-Trade-Off-Modelle, 4-Felder-SWOT und Reue-Minimierung an, um eine glasklare Empfehlung zu liefern.',
    fieldTitleLabel: 'Welche Entscheidung möchten Sie treffen?',
    fieldTitlePlaceholder: 'z.B. Angebot im Startup annehmen vs. Im Großkonzern bleiben',
    fieldTitleHelp: 'Formulieren Sie es als Frage oder Vergleich Ihrer Möglichkeiten.',
    fieldContextLabel: 'Kontext & Rahmenbedingungen (Optional)',
    fieldContextPlaceholder: 'Finanzielle Puffer, familiäre Aspekte, Risikobereitschaft oder No-Gos...',
    fieldContextHelp: 'Echte Rahmenbedingungen führen zu wesentlich präziseren strategischen Empfehlungen.',
    fieldOptionsLabel: 'Verfügbare Optionen',
    fieldOptionsHelp: 'Vergleichen Sie zwischen 2 und 5 Wegen.',
    addOptionBtn: '+ Option Hinzufügen',
    optionPlaceholder: 'Option',
    fieldPrioritiesLabel: 'Kernwerte & Prioritäten (Was zählt am meisten?)',
    fieldPrioritiesHelp: 'Hilft der KI, die Optionen nach Ihren persönlichen Werten zu gewichten.',
    addPriorityBtn: '+ Priorität Hinzufügen',
    priorityPlaceholder: 'z.B. Work-Life-Balance, Langfristiger Wohlstand, Persönliches Wachstum',
    targetLanguageLabel: 'Ausgabesprache der Analyse',
    targetLanguageHelp: 'Die KI erstellt die gesamte Analyse in Ihrer bevorzugten Sprache.',
    targetLanguageAuto: 'Entspricht Interface-Sprache / Eingabe',
    breakTheTieBtn: 'Entscheidung mit KI Treffen',
    analyzingBtn: 'Analysiere Optionen...',
    quickPresetsTitle: 'Oder wählen Sie eine klassische Dilemma-Vorlage:',
    loadPresetBtn: 'Vorlage Laden',

    tabVerdict: 'Klares Urteil',
    tabProsCons: 'Pro & Contra',
    tabMatrix: 'Kriterienmatrix',
    tabSwot: '4-Felder-SWOT',
    tabSimulator: 'Was-Wäre-Wenn-Simulator',

    verdictWinningRecommendation: 'Klare Empfehlung',
    verdictConfidence: 'Konfidenzindex',
    verdictTiebreakerFactor: 'Der Entscheidende Dreh- und Angelpunkt',
    verdictTiebreakerHelp: 'Der ausschlaggebende Grund, der das Patt zwischen den Optionen bricht.',
    verdictCoreReasoning: 'Strategische Begründung & Synthese',
    verdictRegretCheck: 'Reue-Minimierungs-Test (10/10/10-Perspektive)',
    verdictRegretSubtitle: 'Wie werden Sie in 10 Minuten, 10 Monaten und 10 Jahren darauf zurückblicken?',
    verdictGutCheck: 'Bauchgefühl-Prüfung',
    verdictGutSubtitle: 'Eine gezielte Frage, um Ihre unbewusste Überzeugung zu testen.',
    verdictActionPlan: 'Sofortiger Handlungsplan',
    verdictActionSubtitle: 'Konkrete Schritte, um diesen Weg ohne Zweifel einzuschlagen.',
    verdictCriticalRisks: 'Kritische Risiken',
    verdictRisksSubtitle: 'Wesentliche Stolpersteine nach der Entscheidung.',
    verdictStep: 'Schritt',

    backToInput: 'Eingaben Bearbeiten',
    analyzedOn: 'Analysiert am',
    copyReport: 'Bericht Kopieren',
    copiedToClipboard: 'Markdown-Bericht in die Zwischenablage kopiert!',
    downloadMarkdown: 'Markdown Exportieren',
    translateReportBtn: 'Bericht Übersetzen',
    translateReportTooltip: 'Übersetzen Sie diese Entscheidungsanalyse mit KI in jede beliebige Sprache',
    translatedBadge: 'Übersetzt nach',
    viewOriginalBtn: 'Original Anzeigen',
    viewTranslatedBtn: 'Übersetzung Anzeigen',

    fitScore: 'Passungs-Score',
    prosTitle: 'Vorteile (Pro)',
    consTitle: 'Risiken & Nachteile (Contra)',
    addProBtn: '+ Eigenes Pro Hinzufügen',
    addConBtn: '+ Eigenes Contra Hinzufügen',
    impactLow: 'Geringe Wirkung',
    impactMedium: 'Mittlere Wirkung',
    impactHigh: 'Hohe Wirkung',
    impactCritical: 'Kritischer Faktor',
    rationaleLabel: 'Begründung',
    mitigationLabel: 'Empfohlene Gegenmaßnahme',
    customBadge: 'Benutzerdefiniert',

    matrixSummaryTitle: 'Multikriterien-Bewertungsübersicht',
    matrixCriterionCol: 'Bewertungsdimension',
    matrixWeightCol: 'Gewichtung',
    matrixLeadingCol: 'Beste Option',
    matrixScoreOutOfTen: '/10',

    swotStrengths: 'Stärken (Interne Vorteile)',
    swotWeaknesses: 'Schwächen (Interne Defizite)',
    swotOpportunities: 'Chancen (Externe Rückenwinde)',
    swotThreats: 'Risiken (Externe Gegenwinde)',
    swotStrategicImplication: 'Strategisches Fazit',

    simulatorTitle: 'Was-Wäre-Wenn Szenarien-Simulator',
    simulatorSubtitle: 'Testen Sie hypothetische Änderungen von Rahmenbedingungen.',
    simulatorInputPlaceholder: 'Was passiert, wenn die Zinsen fallen? Was, wenn ich in 6 Monaten befördert werde?',
    simulatorRunBtn: 'Szenario Simulieren',
    simulatorRunningBtn: 'Simulation läuft...',
    simulatorFlipsVerdict: 'Kippt die Siegeroption!',
    simulatorReinforces: 'Bestätigt das Originalurteil',
    simulatorNuance: 'Bringt Nuancen (Kein Wechsel)',
    simulatorActionableTip: 'Praxistest vor Festlegung',
    simulatorPromptChipsTitle: 'Schnelltests:',

    translateModalTitle: 'Entscheidungsanalyse Übersetzen',
    translateModalDesc: 'Übersetzen Sie jede Facette, SWOT und Handlungsschritte mit Gemini KI.',
    translateModalSelectLang: 'Zielsprache Wählen',
    translateModalCustomLang: 'Oder andere Sprache angeben:',
    translateModalCustomPlaceholder: 'z.B. Griechisch, Thailändisch, Arabisch, Polnisch...',
    translateModalActionBtn: 'Bericht Übersetzen',
    translateModalTranslating: 'Übersetze mit Gemini KI...',
    translateModalCancel: 'Abbrechen',

    historyTitle: 'Gespeicherte Analysen',
    historySearchPlaceholder: 'Nach Titel oder Option suchen...',
    historyEmptyTitle: 'Noch keine Entscheidungen gespeichert',
    historyEmptyDesc: 'Ihre Entscheidungsberichte werden lokal im Browser abgelegt.',
    historyLoadBtn: 'Öffnen',
    historyDeleteBtn: 'Löschen',
    historyClearAllBtn: 'Alle Löschen',
    historySavedCount: 'gespeichert',

    loadingStep1: 'Katalogisiere Trade-offs & versteckte Kosten...',
    loadingStep2: 'Erstelle gewichtete Kriterienmatrix...',
    loadingStep3: 'Synthetisiere 4-Felder-SWOT...',
    loadingStep4: 'Wende Bezos Reue-Minimierungslogik an...',
    loadingStep5: 'Finalisiere Empfehlung und Handlungsplan...',
  },

  zh: {
    appName: 'Arbitr (决断仲裁者)',
    appSlogan: 'AI 决策科学与认知仲裁器',
    navNewDecision: '新建决策',
    navHistory: '历史记录',
    navPresets: '模板库',
    navAbout: '关于 Arbitr',
    navTerms: '服务与使用条款',
    navPrivacy: '隐私保护政策',
    navLanguage: '语言 / Language',

    formHeading: '告别选择困难与决策瘫痪',
    formSubheading: '输入备选方案、背景约束和核心价值观。Arbitr 采用多准则权衡建模、四象限 SWOT 及无悔测试，给出清晰且具实操性的决策建议。',
    fieldTitleLabel: '你正在纠结什么决策？',
    fieldTitlePlaceholder: '例如：跳槽至高增长初创公司 vs 留在成熟稳定大厂',
    fieldTitleHelp: '以问题或路径对比的形式描述你的核心抉择。',
    fieldContextLabel: '背景细节与现实约束（可选）',
    fieldContextPlaceholder: '说明财务储备、家庭责任、风险偏好、时间节点或不可退让的底线...',
    fieldContextHelp: '提供真实约束将使 AI 的战略推理和防坑建议大幅提升。',
    fieldOptionsLabel: '备选方案',
    fieldOptionsHelp: '支持对比 2 到 5 条不同路径。',
    addOptionBtn: '+ 添加方案',
    optionPlaceholder: '方案',
    fieldPrioritiesLabel: '核心价值观与优先考量（对你而言什么最关键？）',
    fieldPrioritiesHelp: '帮助模型按照你的个人价值尺度进行权重打分。',
    addPriorityBtn: '+ 添加优先项',
    priorityPlaceholder: '例如：工作生活平衡、长远财务回报、个人认知成长',
    targetLanguageLabel: '分析报告输出语言',
    targetLanguageHelp: 'AI 将使用你指定的语言生成完整深度的决策报告。',
    targetLanguageAuto: '与界面语言 / 输入一致',
    breakTheTieBtn: '让 AI 打破僵局',
    analyzingBtn: '正在权衡全景方案...',
    quickPresetsTitle: '或快速加载经典两难决策模板：',
    loadPresetBtn: '载入模板',

    tabVerdict: '决定性裁决',
    tabProsCons: '优劣势对比 (Pros & Cons)',
    tabMatrix: '多维度权衡矩阵',
    tabSwot: '四象限 SWOT',
    tabSimulator: '假设情景模拟器',

    verdictWinningRecommendation: '最终制胜推荐',
    verdictConfidence: '决断置信指数',
    verdictTiebreakerFactor: '决定胜负的破局关键 (Tiebreaker)',
    verdictTiebreakerHelp: '打破双选僵局的核心支点，直击本质。',
    verdictCoreReasoning: '核心战略研判与深度逻辑',
    verdictRegretCheck: '贝索斯最小后悔检验 (10/10/10 视角)',
    verdictRegretSubtitle: '10分钟、10个月与10年之后，你会如何看待今天的决定？',
    verdictGutCheck: '潜意识直觉自测',
    verdictGutSubtitle: '一个穿透迷茫的自测问题，检验真实潜意识倾向。',
    verdictActionPlan: '落地行动承诺清单',
    verdictActionSubtitle: '消除内耗，即刻迈出的顺畅执行步骤。',
    verdictCriticalRisks: '关键风险警戒线',
    verdictRisksSubtitle: '做出选择后需要时刻监控的潜在暗礁。',
    verdictStep: '步骤',

    backToInput: '编辑输入',
    analyzedOn: '分析时间',
    copyReport: '复制完整报告',
    copiedToClipboard: '已复制 Markdown 决策报告至剪贴板！',
    downloadMarkdown: '导出 Markdown',
    translateReportBtn: '翻译决策报告',
    translateReportTooltip: '使用 AI 将整份决策分析无损翻译成任意语言',
    translatedBadge: '已翻译为',
    viewOriginalBtn: '查看原文',
    viewTranslatedBtn: '查看翻译版',

    fitScore: '综合契合度得分',
    prosTitle: '核心优势 (Pros)',
    consTitle: '潜在隐患与代价 (Cons)',
    addProBtn: '+ 自定义优势',
    addConBtn: '+ 自定义劣势',
    impactLow: '轻度影响',
    impactMedium: '中度影响',
    impactHigh: '重大影响',
    impactCritical: '决定性影响',
    rationaleLabel: '底层逻辑',
    mitigationLabel: '对冲防范建议',
    customBadge: '用户自定',

    matrixSummaryTitle: '多维度加权打分总结',
    matrixCriterionCol: '评估维度',
    matrixWeightCol: '权重',
    matrixLeadingCol: '领先方案',
    matrixScoreOutOfTen: '/10分',

    swotStrengths: '优势 S (内部内在长板)',
    swotWeaknesses: '劣势 W (内部薄弱短板)',
    swotOpportunities: '机遇 O (外部借力契机)',
    swotThreats: '挑战 T (外部系统性风险)',
    swotStrategicImplication: '战略启示',

    simulatorTitle: '假设情境压力测试 (What-If)',
    simulatorSubtitle: '输入外部变化或极端前提，检验推荐方案是否会发生逆转。',
    simulatorInputPlaceholder: '例如：如果利率大幅下调 2% 呢？如果半年内团队发生重组呢？',
    simulatorRunBtn: '运行情境模拟',
    simulatorRunningBtn: '正在演练推导...',
    simulatorFlipsVerdict: '推翻了原推荐方案！',
    simulatorReinforces: '进一步巩固原推荐',
    simulatorNuance: '增加权衡细节（未逆转）',
    simulatorActionableTip: '下决断前可执行的实证小测试',
    simulatorPromptChipsTitle: '快速测试预设：',

    translateModalTitle: '翻译决策全案分析',
    translateModalDesc: '保留原本所有量化得分、矩阵结构与行动方案，由 Gemini 进行地道语境翻译。',
    translateModalSelectLang: '选择目标语言',
    translateModalCustomLang: '或输入其他任意语种：',
    translateModalCustomPlaceholder: '例如：粤语、世界语、芬兰语、阿拉伯语...',
    translateModalActionBtn: '开始翻译整份报告',
    translateModalTranslating: 'Gemini AI 正在翻译中...',
    translateModalCancel: '取消',

    historyTitle: '已归档的决策方案',
    historySearchPlaceholder: '按标题或选项关键词检索...',
    historyEmptyTitle: '暂无已存决策',
    historyEmptyDesc: '你在本站分析的所有决策都会安全保存在浏览器本地。',
    historyLoadBtn: '打开研判报告',
    historyDeleteBtn: '删除',
    historyClearAllBtn: '清空历史',
    historySavedCount: '条记录',

    loadingStep1: '正在盘点隐性成本与深层权衡...',
    loadingStep2: '正在构建多维度加权评价矩阵...',
    loadingStep3: '正在推演全路径 4 象限 SWOT...',
    loadingStep4: '正在执行贝索斯无悔准则与破局仲裁...',
    loadingStep5: '正在生成决断报告与行动计划...',
  },

  ja: {
    appName: 'Arbitr (決断の調停者)',
    appSlogan: 'AI 意思決定科学 & 認知的アービター',
    navNewDecision: '新規の決断',
    navHistory: '履歴',
    navPresets: 'テンプレート',
    navAbout: 'Arbitr について',
    navTerms: '利用規約',
    navPrivacy: 'プライバシーポリシー',
    navLanguage: '言語 / Language',

    formHeading: '決断の迷いを論理的に打破する',
    formSubheading: '選択肢、前提条件、大切にしたい価値観を入力してください。多基準トレードオフ分析、4象限SWOT、後悔最小化フレームワークで明確な結論を導きます。',
    fieldTitleLabel: 'どのような選択に迷っていますか？',
    fieldTitlePlaceholder: '例：成長スタートアップへの転職 vs 安定した大企業での残留',
    fieldTitleHelp: '問いの形や2つ以上の選択肢の対比として記述してください。',
    fieldContextLabel: '背景と制約条件（任意）',
    fieldContextPlaceholder: '家族の事情、経済的余裕、リスク許容度、譲れない条件など...',
    fieldContextHelp: '具体的な制約を共有することで、極めて鋭い戦略的アドバイスが得られます。',
    fieldOptionsLabel: '検討中の選択肢',
    fieldOptionsHelp: '2〜5個の選択肢を比較できます。',
    addOptionBtn: '+ 選択肢を追加',
    optionPlaceholder: '選択肢',
    fieldPrioritiesLabel: '重視する価値観・優先順位',
    fieldPrioritiesHelp: 'あなたが大切にしたい軸に沿ってAIが評価します。',
    addPriorityBtn: '+ 優先軸を追加',
    priorityPlaceholder: '例：ワークライフバランス、長期的資産形成、知的好奇心',
    targetLanguageLabel: '分析レポートの言語',
    targetLanguageHelp: '指定した言語でレポート全文を出力します。',
    targetLanguageAuto: '画面の言語 / 入力に合わせる',
    breakTheTieBtn: 'AIで決着をつける',
    analyzingBtn: '選択肢を精査中...',
    quickPresetsTitle: '定番の意思決定テンプレートを試す：',
    loadPresetBtn: 'テンプレートを読み込む',

    tabVerdict: '決定的な判定',
    tabProsCons: 'メリット & デメリット',
    tabMatrix: '比較評価マトリクス',
    tabSwot: '4象限SWOT分析',
    tabSimulator: 'もしもシミュレーター',

    verdictWinningRecommendation: '推奨される最善手',
    verdictConfidence: '確信度スコア',
    verdictTiebreakerFactor: '決め手となる分岐点 (Tiebreaker Factor)',
    verdictTiebreakerHelp: '膠着状態を打破する決定的な要因。',
    verdictCoreReasoning: '戦略的理由と総合判断',
    verdictRegretCheck: '後悔最小化テスト (10/10/10視点)',
    verdictRegretSubtitle: '10分後、10ヶ月後、10年後に振り返った時、どう感じるか？',
    verdictGutCheck: '直感の診断チェック',
    verdictGutSubtitle: '自身の深層心理と本音を確かめる問い。',
    verdictActionPlan: '即時アクションプラン',
    verdictActionSubtitle: '迷いを断ち切ってスムーズに実行するための手順。',
    verdictCriticalRisks: '警戒すべきリスク',
    verdictRisksSubtitle: '決断後に注視すべき落とし穴。',
    verdictStep: 'ステップ',

    backToInput: '入力を編集',
    analyzedOn: '分析日時',
    copyReport: 'レポートをコピー',
    copiedToClipboard: 'Markdown形式でクリップボードにコピーしました！',
    downloadMarkdown: 'Markdownを書き出し',
    translateReportBtn: 'レポートを翻訳',
    translateReportTooltip: 'AIを使ってこの決定レポート全体を任意の言語に即座に翻訳します',
    translatedBadge: '翻訳済み：',
    viewOriginalBtn: '原文を表示',
    viewTranslatedBtn: '翻訳版を表示',

    fitScore: '適合度スコア',
    prosTitle: 'メリット・優位性 (Pros)',
    consTitle: 'デメリット・懸念事項 (Cons)',
    addProBtn: '+ メリットを追加',
    addConBtn: '+ デメリットを追加',
    impactLow: '影響小',
    impactMedium: '影響中',
    impactHigh: '影響大',
    impactCritical: '極めて重要',
    rationaleLabel: '理由',
    mitigationLabel: 'リスク軽減策',
    customBadge: 'カスタム追加',

    matrixSummaryTitle: '多基準評価の要約',
    matrixCriterionCol: '評価基準',
    matrixWeightCol: '重み',
    matrixLeadingCol: '優位な選択肢',
    matrixScoreOutOfTen: '/10点',

    swotStrengths: '強み S (内在的利点)',
    swotWeaknesses: '弱み W (内在的課題)',
    swotOpportunities: '機会 O (外部の追い風)',
    swotThreats: '脅威 T (外部のリスク)',
    swotStrategicImplication: '戦略的示唆',

    simulatorTitle: 'もしもシミュレーター (What-If)',
    simulatorSubtitle: '前提条件が変わった場合、結論が覆るかを検証します。',
    simulatorInputPlaceholder: '例：半年後に金利が下がったら？もし提示給与が20%上がったら？',
    simulatorRunBtn: 'シナリオを実行',
    simulatorRunningBtn: 'シミュレーション中...',
    simulatorFlipsVerdict: '推奨結論が逆転！',
    simulatorReinforces: '原案の優位性をさらに補強',
    simulatorNuance: '条件付きの留意事項を追加',
    simulatorActionableTip: '決断前に今すぐ試せる検証アクション',
    simulatorPromptChipsTitle: 'クイック質問の例：',

    translateModalTitle: '決定レポートの全編翻訳',
    translateModalDesc: '得点、マトリクス、SWOT、アクションプランの構造を保持したままGeminiで高精度に翻訳します。',
    translateModalSelectLang: '翻訳先の言語を選択',
    translateModalCustomLang: 'または任意の言語を入力：',
    translateModalCustomPlaceholder: '例：イタリア語、ベトナム語、スウェーデン語...',
    translateModalActionBtn: 'レポート全体を翻訳',
    translateModalTranslating: 'Gemini AIで翻訳中...',
    translateModalCancel: 'キャンセル',

    historyTitle: '保存済みの決断レポート',
    historySearchPlaceholder: 'タイトルや選択肢で検索...',
    historyEmptyTitle: '保存された決断はまだありません',
    historyEmptyDesc: '作成したレポートはお使いのブラウザにローカル保存されます。',
    historyLoadBtn: 'レポートを開く',
    historyDeleteBtn: '削除',
    historyClearAllBtn: '全消去',
    historySavedCount: '件保存済み',

    loadingStep1: 'トレードオフと隠れたコストを洗い出し中...',
    loadingStep2: '多基準評価マトリクスを策定中...',
    loadingStep3: '各選択肢の4象限SWOTを統合中...',
    loadingStep4: '後悔最小化と意思決定ロジックを適用中...',
    loadingStep5: '決断の裁定と実行計画を仕上げています...',
  },

  ar: {
    appName: 'Arbitr (فاصل القرارات)',
    appSlogan: 'علم اتخاذ القرارات بالذكاء الاصطناعي والحَكَم المعرفي',
    navNewDecision: 'قرار جديد',
    navHistory: 'السجل',
    navPresets: 'النماذج',
    navAbout: 'عن التطبيق',
    navTerms: 'الشروط والأحكام',
    navPrivacy: 'سياسة الخصوصية',
    navLanguage: 'اللغة',

    formHeading: 'تجاوز حيرة التردد والجمود في اتخاذ القرار',
    formSubheading: 'أدخل الخيارات المطروحة، سياقك وأولوياتك الأساسية. يقوم Arbitr بنمذجة المقايضات، وتحليل سوات الرباعي، واختبار تقليل الندم ليمنحك توصية حاسمة.',
    fieldTitleLabel: 'ما هو القرار الذي تحاول حسمه؟',
    fieldTitlePlaceholder: 'مثال: قبول عرض في شركة ناشئة أم البقاء في وظيفة مستقرة',
    fieldTitleHelp: 'اكتب التساؤل كصيغة مقارنة واضحة بين مساراتك.',
    fieldContextLabel: 'السياق والقيود الواقعية (اختياري)',
    fieldContextPlaceholder: 'اذكر الاعتبارات الأسرية، الهامش المالي، مدى تحملك للمخاطر...',
    fieldContextHelp: 'توفير القيود الحقيقية ينتج تحليلاً استراتيجياً فائق الدقة.',
    fieldOptionsLabel: 'الخيارات قيد المقارنة',
    fieldOptionsHelp: 'قارن بين خيارين إلى 5 خيارات مختلفة.',
    addOptionBtn: '+ إضافة خيار',
    optionPlaceholder: 'الخيار',
    fieldPrioritiesLabel: 'الأولويات والقيم الجوهرية (ما هو الأهم بالنسبة لك؟)',
    fieldPrioritiesHelp: 'تساعد الذكاء الاصطناعي على تقييم المسارات بما يتوافق مع قيمك.',
    addPriorityBtn: '+ إضافة أولوية',
    priorityPlaceholder: 'مثال: التوازن الحياتي، النمو المالي طويل الأجل، راحة البال',
    targetLanguageLabel: 'لغة التحليل الصادر',
    targetLanguageHelp: 'سيقوم الذكاء الاصطناعي بإعداد التقرير بالكامل باللغة المختارة.',
    targetLanguageAuto: 'تطابق لغة الواجهة / الإدخال',
    breakTheTieBtn: 'احسم القرار بالذكاء الاصطناعي',
    analyzingBtn: 'جاري التقييم والتحليل...',
    quickPresetsTitle: 'أو جرّب أحد نماذج القرارات الشائعة:',
    loadPresetBtn: 'تحميل النموذج',

    tabVerdict: 'الحكم الحاسم',
    tabProsCons: 'الإيجابيات والسلبيات',
    tabMatrix: 'مصفوفة المعايير',
    tabSwot: 'تحليل سوات SWOT',
    tabSimulator: 'محاكي الافتراضات',

    verdictWinningRecommendation: 'التوصية الحاسمة',
    verdictConfidence: 'مؤشر الثقة',
    verdictTiebreakerFactor: 'نقطة التحول الفاصلة (عامل الحسم)',
    verdictTiebreakerHelp: 'السبب الجوهري الذي يكسر التعادل بين خياراتك دون مساومة.',
    verdictCoreReasoning: 'الاستدلال والتحليل الاستراتيجي',
    verdictRegretCheck: 'اختبار تقليل الندم (منظور 10/10/10)',
    verdictRegretSubtitle: 'كيف ستنظر إلى هذا القرار بعد 10 دقائق، 10 أشهر، و10 سنوات؟',
    verdictGutCheck: 'فحص الحدس الداخلي',
    verdictGutSubtitle: 'سؤال لاختبار يقينك الباطني الصادق.',
    verdictActionPlan: 'خطة العمل الفورية',
    verdictActionSubtitle: 'خطوات عملية للالتزام بهذا الخيار بكل ثقة وبدون تردد.',
    verdictCriticalRisks: 'المخاطر الحرجة للمراقبة',
    verdictRisksSubtitle: 'عقبات محتملة يجب الاحتراس منها بعد الحسم.',
    verdictStep: 'خطوة',

    backToInput: 'تعديل المدخلات',
    analyzedOn: 'تاريخ التحليل',
    copyReport: 'نسخ التقرير',
    copiedToClipboard: 'تم نسخ تقرير Markdown إلى الحافظة!',
    downloadMarkdown: 'تصدير Markdown',
    translateReportBtn: 'ترجمة التقرير',
    translateReportTooltip: 'ترجمة هذا التحليل بالكامل إلى أي لغة عبر الذكاء الاصطناعي',
    translatedBadge: 'مترجم إلى',
    viewOriginalBtn: 'عرض الأصل',
    viewTranslatedBtn: 'عرض المترجم',

    fitScore: 'درجة التوافق الشاملة',
    prosTitle: 'المكاسب والمزايا (الإيجابيات)',
    consTitle: 'الأعباء والمخاطر (السلبيات)',
    addProBtn: '+ إضافة إيجابية مخصصة',
    addConBtn: '+ إضافة سلبية مخصصة',
    impactLow: 'أثر منخفض',
    impactMedium: 'أثر متوسط',
    impactHigh: 'أثر مرتفع',
    impactCritical: 'أثر حاسم',
    rationaleLabel: 'التعليل',
    mitigationLabel: 'الحل الوقائي المقترح',
    customBadge: 'مضاف من المستخدم',

    matrixSummaryTitle: 'ملخص التقييم متعدد المعايير',
    matrixCriterionCol: 'معيار التقييم',
    matrixWeightCol: 'الوزن',
    matrixLeadingCol: 'الخيار المتفوق',
    matrixScoreOutOfTen: '/10',

    swotStrengths: 'نقاط القوة (مزايا داخلية)',
    swotWeaknesses: 'نقاط الضعف (عجز داخلي)',
    swotOpportunities: 'الفرص (رياح مواتية خارجية)',
    swotThreats: 'التهديدات (مخاطر خارجية)',
    swotStrategicImplication: 'الاستنتاج الاستراتيجي',

    simulatorTitle: 'محاكي السيناريوهات "ماذا لو؟"',
    simulatorSubtitle: 'اختبر مدى صمود التوصية في حال تغير الظروف والمعطيات.',
    simulatorInputPlaceholder: 'ماذا لو انخفضت أسعار الفائدة؟ ماذا لو حصلت على ترقية بعد 6 أشهر؟',
    simulatorRunBtn: 'تشغيل المحاكاة',
    simulatorRunningBtn: 'جاري محاكاة السيناريو...',
    simulatorFlipsVerdict: 'يغير الخيار الموصى به!',
    simulatorReinforces: 'يعزز التوصية الأصلية',
    simulatorNuance: 'يضيف اعتبارات جديدة (دون تغيير الفائز)',
    simulatorActionableTip: 'اختبار عملي قبل الالتزام النهائي',
    simulatorPromptChipsTitle: 'أسئلة مقترحة سريعة:',

    translateModalTitle: 'ترجمة التقرير التحليلي',
    translateModalDesc: 'ترجمة كامل تفاصيل التقرير مع الحفاظ على التقييمات عبر نموذج Gemini.',
    translateModalSelectLang: 'اختر اللغة المستهدفة',
    translateModalCustomLang: 'أو حدد لغة أخرى:',
    translateModalCustomPlaceholder: 'مثال: الفارسية، الإندونيسية، الروسية...',
    translateModalActionBtn: 'ترجمة التقرير كاملاً',
    translateModalTranslating: 'جاري الترجمة بواسطة Gemini...',
    translateModalCancel: 'إلغاء',

    historyTitle: 'القرارات المحفوظة',
    historySearchPlaceholder: 'ابحث بالعنوان أو الخيار...',
    historyEmptyTitle: 'لا توجد قرارات محفوظة بعد',
    historyEmptyDesc: 'يتم حفظ جميع تحليلاتك محلياً في متصفحك بشكل آمن.',
    historyLoadBtn: 'فتح التحليل',
    historyDeleteBtn: 'حذف',
    historyClearAllBtn: 'مسح الكل',
    historySavedCount: 'محفوظ',

    loadingStep1: 'جاري فحص المقايضات والتكاليف الخفية...',
    loadingStep2: 'بناء مصفوفة التقييم متعددة المعايير...',
    loadingStep3: 'توليف مصفوفة سوات الرباعية لكل مسار...',
    loadingStep4: 'تطبيق منطق تقليل الندم وحسم التعادل...',
    loadingStep5: 'وضع اللمسات الأخيرة للتوصية وخطة العمل...',
  },
  tl,
  ko,
  pt,
  ru,
  it,
  hi,
  nl,
  tr,
  pl,
  vi,
  id,
  sv,
  da,
};

// Fallback lookup: if a key is missing in chosen language, falls back to English
export function getTranslation(lang: string = 'en'): TranslationDictionary {
  const base = TRANSLATIONS.en;
  const target = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return { ...base, ...target };
}

export function isRTL(lang: string = 'en'): boolean {
  const opt = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return Boolean(opt?.rtl);
}

export function getLanguageName(code: string): string {
  const opt = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return opt ? `${opt.flag} ${opt.nativeName}` : code;
}
