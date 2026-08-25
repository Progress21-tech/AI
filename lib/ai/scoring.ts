import { ProblemRecord } from './types';

/**
 * Calculates Opportunity Score for a problem based on Section 21 of the PRD:
 * Opportunity Score = Pain/Severity x Frequency x Impact x Solution Gap x Confidence
 */
export function calculateOpportunityScore(problem: ProblemRecord): number {
  const pain = Math.max(1, Math.min(10, problem.severity || 5));

  // Frequency Multiplier
  let frequencyFactor = 1.0;
  switch (problem.frequency) {
    case 'daily':
      frequencyFactor = 2.5;
      break;
    case 'weekly':
      frequencyFactor = 1.8;
      break;
    case 'monthly':
      frequencyFactor = 1.2;
      break;
    case 'quarterly':
      frequencyFactor = 0.8;
      break;
    case 'ad_hoc':
      frequencyFactor = 0.6;
      break;
  }

  // Time / Financial Impact Multiplier
  let impactFactor = 1.0;
  if (problem.timeImpact === 'high') impactFactor = 2.0;
  else if (problem.timeImpact === 'medium') impactFactor = 1.4;
  else impactFactor = 1.0;

  // Solution Gap Multiplier (higher if workaround is manual/fragile)
  let solutionGapFactor = 1.2;
  const workaround = (problem.currentWorkaround || '').toLowerCase();
  if (workaround.includes('whatsapp') || workaround.includes('spreadsheet') || workaround.includes('manual') || workaround.includes('email')) {
    solutionGapFactor = 1.8;
  } else if (workaround.includes('none') || workaround.includes('unknown')) {
    solutionGapFactor = 1.5;
  }

  const confidence = Math.max(0.1, Math.min(1.0, problem.confidence || 0.5));

  const rawScore = pain * frequencyFactor * impactFactor * solutionGapFactor * confidence;
  
  // Normalize to 1 - 100 range for display
  return Math.round(Math.min(100, Math.max(1, rawScore * 2.5)));
}
