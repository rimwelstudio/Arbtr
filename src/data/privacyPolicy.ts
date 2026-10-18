export interface PrivacySection {
  id: string;
  title: string;
  badge?: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
  importantNotice?: string;
}

export const PRIVACY_METADATA = {
  appName: 'Arbitr',
  website: 'https://arbitrapp.com',
  domain: 'arbitrapp.com',
  handle: '@arbitrapp',
  effectiveDate: 'September 14, 2026',
  lastUpdated: 'September 14, 2026',
  version: '2.4',
  dpoEmail: 'privacy@arbitrapp.com',
  supportEmail: 'support@arbitrapp.com',
  legalEmail: 'legal@arbitrapp.com',
};

export const PRIVACY_KEY_HIGHLIGHTS = [
  {
    icon: 'ShieldCheck',
    title: 'Zero Data Brokering',
    description:
      'We never sell, rent, trade, or monetize your personal decisions, scenario matrices, or dilemma content to data brokers or third-party advertisers.',
  },
  {
    icon: 'Lock',
    title: 'UID-Isolated Cloud Storage',
    description:
      'When signed in, your scenarios are synced to Google Firebase Firestore under strict security rules accessible exclusively by your authenticated UID.',
  },
  {
    icon: 'Cpu',
    title: 'Server-Side AI Processing',
    description:
      'Decision dilemmas sent to Google Gemini for bias detection and Devil’s Advocate evaluation pass through an encrypted server proxy without client-side key exposure.',
  },
  {
    icon: 'Mic',
    title: 'Ephemeral Voice Deliberation',
    description:
      'Zena interactive voice deliberation parses speech ephemerally via client speech recognition and secure streaming. Raw voice recordings are never stored.',
  },
  {
    icon: 'Download',
    title: 'Full Export & Deletion Rights',
    description:
      'You maintain complete ownership of your data with seamless JSON/PDF export capabilities and irreversible one-click scenario and account deletion.',
  },
];

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 'overview',
    title: '1. Introduction and Scope',
    badge: 'Scope',
    summary:
      'Arbitr respects your privacy and is committed to protecting the confidential scenarios, criteria, and personal evaluations you enter.',
    paragraphs: [
      'This Privacy Policy describes how Arbitr Decision Intelligence ("Arbitr", "we", "us", or "our") collects, protects, processes, and handles information when you visit or use the Arbitr web application, mobile interfaces, voice features, and services hosted at arbitrapp.com (the "Service").',
      'By accessing or using Arbitr, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our data practices as described herein, please refrain from using the Service or creating an account.',
      'We design our systems under the foundational principle of data minimization: we only process data that is strictly necessary to calculate decision matrices, detect cognitive biases, provide AI-assisted insights, and sync your work across sessions.',
    ],
  },
  {
    id: 'data-collected',
    title: '2. Information We Collect',
    badge: 'Collection',
    summary:
      'We collect authentication credentials, user-provided decision scenarios, voice deliberation inputs, and diagnostic performance metrics.',
    paragraphs: [
      'We categorize the data collected through Arbitr into three primary groups: information you explicitly provide, data generated during cognitive analysis, and automated device diagnostics.',
    ],
    bullets: [
      'Account & Identity Data: When signing in via Firebase Authentication (Google OAuth, Apple, Facebook, or Email/Password), we receive your primary email address, public display name, avatar URL, and assigned unique user identifier (UID). We never receive or store third-party account passwords.',
      'Decision Scenarios & Matrix Data: Dilemma titles, contextual notes, categorized options, customized criteria, priority weightings, risk tolerance preferences, outcome evaluations, and historical decision journals.',
      'Voice & Audio Inputs: When utilizing Zena voice deliberation, audio input is captured via your browser’s Web Speech API or microphone input for real-time speech-to-text translation and cognitive response generation. Audio streams are processed ephemerally and discarded immediately after transcription.',
      'Local Application State: We store your active theme preference (Dark/Light mode), language selection, audio mute preferences, and recent offline scenario drafts in browser localStorage and IndexedDB.',
      'Technical & Diagnostic Metrics: Browser type, operating system, timestamped error logs, performance latencies, and anonymized interaction milestones to ensure platform stability and prevent abuse.',
    ],
  },
  {
    id: 'how-we-use-data',
    title: '3. How We Use Your Information',
    badge: 'Usage',
    summary:
      'Your information is used exclusively to provide decision intelligence, sync scenarios across devices, and deliver AI verdicts.',
    paragraphs: [
      'Every piece of information processed by Arbitr serves a direct functional purpose within your decision-making workflow. We do not engage in behavioral advertising, retargeting, or profiling for commercial third parties.',
    ],
    bullets: [
      'To calculate weighted decision scores, sensitivity analyses, and tradeoff matrices tailored to your criteria.',
      'To synthesize structured Devil’s Advocate challenges and cognitive bias checks via generative AI models.',
      'To synchronize your saved decisions across your desktop, tablet, and mobile devices through Google Firestore.',
      'To power two-way conversational voice reasoning during Zena deliberation sessions.',
      'To authenticate your identity, prevent unauthorized access to private scenarios, and protect against security breaches.',
      'To comply with applicable legal obligations, dispute resolution, and enforcement of our Terms and Conditions.',
    ],
  },
  {
    id: 'ai-processing',
    title: '4. Artificial Intelligence & Machine Learning Architecture',
    badge: 'AI Architecture',
    summary:
      'AI analysis is performed via an encrypted server proxy with Google Gemini. Your private scenarios are not used to train public models.',
    importantNotice:
      'Arbitr never uses your private decision scenarios, personal dilemma details, or financial numbers to train public foundation models.',
    paragraphs: [
      'Arbitr integrates Google Gemini state-of-the-art multimodal models to generate devil’s advocate critiques, spot blind spots, and produce decision executive summaries.',
      'Security Architecture: All AI queries are routed through our secure, containerized server-side API proxy. The Gemini API key and backend credentials remain strictly hidden on the server and are never exposed to browser dev tools or network inspect panels.',
      'Ephemeral AI Ingestion: Prompts passed to the AI engine contain only the text of your active scenario, criteria, and options. Under our enterprise API terms with Google Cloud, API inputs and outputs are not retained or utilized to train future public foundation models without your explicit opt-in.',
    ],
  },
  {
    id: 'storage-and-security',
    title: '5. Data Storage, Cloud Sync, and Security',
    badge: 'Security',
    summary:
      'Cloud data is stored in Google Firebase Firestore with AES-256 encryption at rest and strict per-user UID access rules.',
    paragraphs: [
      'We implement defense-in-depth technical and organizational measures to safeguard your information from unauthorized access, loss, or alteration.',
    ],
    bullets: [
      'UID Isolation in Firestore: Cloud documents are structured under users/{userId}/decisions. Firestore security rules cryptographically enforce that only requests bearing an authenticated Firebase token matching {userId} can read, create, update, or delete records.',
      'Encryption Standards: All communications between your client device, our Express application server, Firebase services, and Google Gemini are encrypted using Transport Layer Security (TLS 1.3). Stored database records are encrypted at rest with AES-256.',
      'Offline-First Capability: Unauthenticated sessions keep scenario drafts isolated strictly within your local browser storage. No cloud transmissions take place until you intentionally sign in or invoke AI analysis.',
      'Key Security: Production service accounts, database connection strings, and AI credentials are administered through isolated environment configuration files and Google Cloud Secret Management.',
    ],
  },
  {
    id: 'third-party-services',
    title: '6. Third-Party Service Providers',
    badge: 'Subprocessors',
    summary:
      'We partner with industry-leading infrastructure providers under strict data protection agreements.',
    paragraphs: [
      'Arbitr relies on trusted third-party cloud infrastructure to deliver real-time responsiveness and high availability. These subprocessors are bound by stringent confidentiality and security commitments:',
    ],
    bullets: [
      'Google Firebase & Google Cloud Platform: Identity authentication (Google, Apple, Facebook, Email), cloud database hosting (Cloud Firestore), and container runtime execution (Cloud Run).',
      'Google Gemini API: Multimodal language model reasoning and cognitive analysis for structured verdicts and Devil’s Advocate counter-arguments.',
      'Browser Web Speech Engine: Local voice synthesis and recognition for voice-enabled interaction.',
    ],
  },
  {
    id: 'user-rights-gdpr-ccpa',
    title: '7. Your Rights and Global Privacy Protections (GDPR & CCPA/CPRA)',
    badge: 'Your Rights',
    summary:
      'You possess full rights to access, export, correct, and permanently delete your decision data at any time.',
    paragraphs: [
      'Regardless of your geographic location, Arbitr affords you universal control over your personal data, complying with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act as amended (CCPA/CPRA), and related global standards:',
    ],
    bullets: [
      'Right to Access & Portability: You can view all saved decisions in your History dashboard and export your complete decision records as structured JSON or printable reports.',
      'Right to Rectification: You may modify, update, re-weigh, or edit any scenario, criteria, or parameter at any point.',
      'Right to Erasure ("Right to be Forgotten"): You can delete individual scenarios or trigger a complete account wipe, which permanently purges your Firestore cloud records.',
      'Right to Restrict Processing: You may choose to use Arbitr without AI analysis or cloud synchronization by utilizing local manual scoring.',
      'Right to Non-Discrimination: We will never deny services, alter pricing, or degrade your application experience should you exercise any of your statutory privacy rights.',
    ],
  },
  {
    id: 'cookies-and-tracking',
    title: '8. Cookies, Local Storage, and Tracking Technologies',
    badge: 'Cookies',
    summary:
      'Arbitr uses strictly necessary cookies and browser local storage. We do not use third-party advertising tracking cookies.',
    paragraphs: [
      'We respect your digital privacy. Arbitr does not employ tracking pixels, cross-site behavioral cookies, or invasive fingerprinting scripts.',
      'Essential Tokens: When you authenticate, Firebase Auth maintains secure session tokens in browser cookies or IndexedDB to keep you signed in securely.',
      'Functional Local Storage: Key-value local storage is utilized strictly to remember your interface preferences (such as light or dark theme mode, audio mute, and active language) and to maintain scenario drafts during transient network disconnects.',
    ],
  },
  {
    id: 'data-retention',
    title: '9. Data Retention and Deletion Schedules',
    badge: 'Retention',
    summary:
      'Your scenarios are kept only as long as you maintain them. Deleted scenarios are removed immediately from active database collections.',
    paragraphs: [
      'We retain your account profile and synced decision scenarios for as long as your account remains active or as needed to provide you with the Service.',
      'Immediate Erasure: When you delete a scenario from your history, the corresponding document in Firestore is permanently deleted from our live cluster. Temporary backup snapshots are purged pursuant to standard rolling cloud retention schedules (typically within 30 days).',
      'Account Termination: You may request account deletion at any time via the application settings or by emailing privacy@arbitrapp.com.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: '10. Children’s Privacy',
    badge: 'Children',
    summary:
      'Arbitr is not intended for or marketed to children under 13 (or under 16 in the European Economic Area).',
    paragraphs: [
      'The Service is designed for adult cognitive deliberation, professional decisions, and students of eligible age. We do not knowingly collect or solicit personal information from children under 13 (or under 16 in the EEA/UK).',
      'If we learn that we have inadvertently collected personal data from a child below the minimum statutory age without verifiable parental consent, we will promptly delete that information from our servers. Parents or guardians who believe their child has provided us with personal information may contact privacy@arbitrapp.com.',
    ],
  },
  {
    id: 'policy-updates',
    title: '11. Changes and Revisions to This Privacy Policy',
    badge: 'Updates',
    summary:
      'We may update this policy periodically. Material changes will be communicated via in-app notices or email announcements.',
    paragraphs: [
      'As Arbitr introduces new decision heuristics, integrations, or compliance features, we may update this Privacy Policy to reflect those enhancements.',
      'The "Last Updated" timestamp at the top of this document will always indicate the effective date of the latest revisions. Your continued use of the Service following the posting of an updated Privacy Policy constitutes your acceptance of the revised practices.',
    ],
  },
  {
    id: 'contact-dpo',
    title: '12. Contacting Us and Data Protection Inquiries',
    badge: 'Contact',
    summary:
      'For privacy inquiries, data export requests, or regulatory questions, reach out directly to our Data Protection team.',
    paragraphs: [
      'If you have questions, feedback, or concerns regarding this Privacy Policy or our data handling practices, please contact our privacy compliance team:',
      'Arbitr Decision Intelligence\nAttn: Privacy Officer & Legal Affairs\nWebsite: arbitrapp.com\nEmail: privacy@arbitrapp.com\nLegal Department: legal@arbitrapp.com',
    ],
  },
];
