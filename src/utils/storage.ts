import { DecisionAnalysisResult } from '../types';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions';

export function getSavedDecisions(): DecisionAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved decisions:', e);
    return [];
  }
}

export function saveDecision(decision: DecisionAnalysisResult): void {
  try {
    const current = getSavedDecisions();
    const filtered = current.filter((d) => d.id !== decision.id);
    const updated = [decision, ...filtered].slice(0, 30); // Keep latest 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save decision:', e);
  }
}

export function deleteSavedDecision(id: string): void {
  try {
    const current = getSavedDecisions();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete decision:', e);
  }
}
