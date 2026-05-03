/**
 * Static walkthrough data — the full Indian election journey in 5 stages.
 * Extracted from routes/ai.js for clean module separation.
 * Used by both the walkthrough endpoint and the fallback system.
 * @module data/walkthrough
 */

const WALKTHROUGH_STAGES = [
  {
    id: 1,
    stage: 'Registration',
    icon: '📝',
    summary: 'Enrolling yourself as an eligible voter in the electoral roll.',
    steps: [
      'Check eligibility — you must be an Indian citizen aged 18+ on the qualifying date.',
      'Visit the official portal (voters.eci.gov.in) or your nearest Electoral Registration Office.',
      'Fill out Form 6 (new voter registration) with personal details.',
      'Upload identity proof (Aadhaar, Passport, or Driving License).',
      'Upload address proof (utility bill, bank statement, or rent agreement).',
      'Submit and note your reference number for tracking.',
    ],
    duration: '1–2 weeks for submission; 15–30 days for processing.',
    nextStage: 'Verification',
    badge: 'Beginner Friendly',
    officialLink: 'https://voters.eci.gov.in/',
  },
  {
    id: 2,
    stage: 'Verification',
    icon: '🔍',
    summary: 'Officials verify your identity and address before adding you to the voter list.',
    steps: [
      'An Electoral Registration Officer (ERO) reviews your Form 6 application.',
      'A Booth Level Officer (BLO) may visit your address for physical verification.',
      'Your identity and address documents are cross-checked against government records.',
      'If discrepancies are found, you may be contacted for corrections.',
      'If approved, your name is added to the electoral roll for your constituency.',
      'You receive your EPIC (Voter ID Card) or can download the e-EPIC online.',
    ],
    duration: '2–4 weeks after application submission.',
    nextStage: 'Polling Day',
    badge: 'Step-by-Step Guidance',
    officialLink: 'https://www.nvsp.in/',
  },
  {
    id: 3,
    stage: 'Polling Day',
    icon: '🏛️',
    summary: 'The day you cast your vote at your assigned polling station.',
    steps: [
      'Locate your assigned polling station on voters.eci.gov.in or the Voter Helpline app.',
      'Carry your Voter ID (EPIC) or any approved photo identification document.',
      'Queue up at the polling station — your name is verified against the electoral roll.',
      'Receive a slip and proceed to the EVM (Electronic Voting Machine).',
      'Press the button next to your chosen candidate and confirm on VVPAT slip.',
      'Your finger is marked with indelible ink to prevent duplicate voting.',
    ],
    duration: 'Polling hours: typically 7:00 AM to 6:00 PM.',
    nextStage: 'Counting',
    badge: 'Timeline Included',
    officialLink: 'https://voterportal.eci.gov.in/',
  },
  {
    id: 4,
    stage: 'Counting',
    icon: '📊',
    summary: 'Votes are tallied under strict supervision to determine election results.',
    steps: [
      'After polling ends, EVMs are sealed and stored in a strongroom under 24/7 security.',
      'On counting day, EVMs are opened in the presence of officials, candidates, and agents.',
      'VVPAT slips are cross-verified for a random sample of booths (as per Supreme Court order).',
      'Votes are tallied round by round for each constituency.',
      'The candidate with the highest votes is declared the winner (First Past The Post system).',
      'Results are published on the Election Commission website in real-time.',
    ],
    duration: 'Counting day is typically 3–5 days after the last phase of polling.',
    nextStage: 'Results',
    badge: 'Verified Educational Info',
    officialLink: 'https://results.eci.gov.in/',
  },
  {
    id: 5,
    stage: 'Results',
    icon: '📢',
    summary: 'Winners are officially announced and the democratic mandate takes effect.',
    steps: [
      'The Election Commission declares official results constituency by constituency.',
      'Winning candidates receive a Certificate of Election from the Returning Officer.',
      'If any candidate disputes results, they can file an election petition in High Court.',
      'The party or coalition with a majority is invited to form the government.',
      'Elected representatives take oath of office within the prescribed timeframe.',
      'The new government begins its term — your vote has shaped the outcome.',
    ],
    duration: 'Results typically declared within 1–2 days of counting.',
    nextStage: 'Your vote has made a difference!',
    badge: 'Verified Educational Info',
    officialLink: 'https://results.eci.gov.in/',
  },
];

module.exports = WALKTHROUGH_STAGES;
