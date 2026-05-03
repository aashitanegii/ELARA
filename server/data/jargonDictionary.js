/**
 * Built-in jargon dictionary for offline fallback responses.
 * Extracted from routes/ai.js for clean module separation.
 * Each entry provides meaning, usage context, importance, and a simple analogy.
 * @module data/jargonDictionary
 */

const JARGON_DB = {
  'electoral college': {
    meaning: 'A system used in the United States where a group of electors — not the general public directly — formally choose the President.',
    where: 'Used in U.S. presidential elections. Each state gets a number of electors based on its population.',
    why: 'It means a candidate can win the presidency without winning the most individual votes nationwide.',
    analogy: 'Think of it like a class election where each row picks a representative, and those representatives cast the final vote.',
  },
  'constituency': {
    meaning: 'A specific geographic area whose residents elect a single representative to the legislature.',
    where: 'Used in India (Lok Sabha/Vidhan Sabha), UK (House of Commons), and many parliamentary democracies.',
    why: 'Your constituency determines which candidates you can vote for and who represents your area.',
    analogy: 'Like dividing a city into neighborhoods, each choosing one person to speak for them at city hall.',
  },
  'gerrymandering': {
    meaning: 'The practice of drawing electoral district boundaries to favor one political party over another.',
    where: 'Most common in the United States, where state legislatures often control redistricting.',
    why: 'It can make elections less competitive and reduce the impact of your vote.',
    analogy: 'Imagine redrawing classroom groups so one team always has more members.',
  },
  'vvpat': {
    meaning: 'Voter Verifiable Paper Audit Trail — a printed slip that lets you confirm your vote was recorded correctly on the EVM.',
    where: 'Used in Indian elections alongside Electronic Voting Machines (EVMs).',
    why: 'It adds a layer of transparency — you can physically see which candidate your vote went to.',
    analogy: 'Like getting a receipt after a purchase so you can verify the transaction.',
  },
  'epic': {
    meaning: 'Electors Photo Identity Card — commonly known as the Voter ID card issued by the Election Commission of India.',
    where: 'Issued to all registered voters in India. Can also be downloaded as e-EPIC.',
    why: 'It is your primary identity document for voting at the polling station.',
    analogy: 'Think of it as your membership card for participating in democracy.',
  },
  'first past the post': {
    meaning: 'An electoral system where the candidate with the most votes in a constituency wins, even without a majority.',
    where: 'Used in India, UK, USA (for Congress), Canada, and many Commonwealth nations.',
    why: 'Simple to understand, but can result in a winner who got less than 50% of votes.',
    analogy: 'Like a race where whoever crosses the finish line first wins — no second rounds.',
  },
  'nota': {
    meaning: 'None Of The Above — an option on the EVM that lets you formally reject all candidates without spoiling your ballot.',
    where: 'Available in Indian elections since 2013, introduced by Supreme Court order.',
    why: 'It gives voters a way to express dissatisfaction with all candidates while still participating in the process.',
    analogy: 'Like being able to say "I came to the restaurant but nothing on the menu appeals to me" — your presence is still recorded.',
  },
  'evm': {
    meaning: 'Electronic Voting Machine — a portable device used in Indian elections to record votes electronically instead of paper ballots.',
    where: 'Used exclusively in Indian elections since 2004. Manufactured by BEL and ECIL under Election Commission supervision.',
    why: 'EVMs make counting faster, reduce invalid votes, and are designed to be tamper-proof with multiple security layers.',
    analogy: 'Think of it as a secure digital ballot box that records your choice at the press of a button.',
  },
};

module.exports = JARGON_DB;
