import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { DecisionAnalysisResult, OptionAnalysis, TiebreakerVerdict, InsightFeedbackItem } from '../types';

/**
 * Recursively strips undefined fields from an object,
 * ensuring Firestore setDoc/updateDoc never fails on unsupported undefined values.
 * Preserves Firestore FieldValue sentinels (like serverTimestamp, deleteField).
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => (item === undefined ? null : sanitizeForFirestore(item))) as unknown as T;
  }
  // Check if it's a plain object (not a FieldValue, Date, or special Firestore class)
  const isPlainObject =
    Object.prototype.toString.call(data) === '[object Object]' &&
    (data.constructor === Object || !data.constructor);

  if (!isPlainObject) {
    return data;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      sanitized[key] = sanitizeForFirestore(val);
    }
  }
  return sanitized as T;
}

/**
 * Maps a Firestore document data snapshot back into the application's DecisionAnalysisResult.
 */
export function mapFirestoreDocToDecision(docId: string, data: any): DecisionAnalysisResult {
  let createdAtStr = new Date().toISOString();
  if (data.createdAt) {
    if (typeof data.createdAt.toDate === 'function') {
      createdAtStr = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt.seconds === 'number') {
      createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
    } else if (typeof data.createdAt === 'string') {
      createdAtStr = data.createdAt;
    }
  }

  // Reconstruct OptionAnalysis models
  const options: OptionAnalysis[] = (data.options || []).map((opt: any, idx: number) => ({
    id: opt.id || `opt-${idx}`,
    name: opt.name || `Option ${idx + 1}`,
    summary: opt.summary || '',
    pros: Array.isArray(opt.pros) ? opt.pros : [],
    cons: Array.isArray(opt.cons) ? opt.cons : [],
    score: typeof opt.score === 'number' ? opt.score : 0,
  }));

  // Reconstruct comparison matrix criteria & weights if not stored at root
  let comparisonMatrix = data.comparisonMatrix;
  if (!comparisonMatrix || !comparisonMatrix.criteria || comparisonMatrix.criteria.length === 0) {
    const firstOptionCriteria = data.options?.[0]?.criteria;
    if (Array.isArray(firstOptionCriteria) && firstOptionCriteria.length > 0) {
      const criteria = firstOptionCriteria.map((c: any, cIdx: number) => {
        const scores: Record<string, number> = {};
        const explanations: Record<string, string> = {};
        (data.options || []).forEach((opt: any, optIdx: number) => {
          const optId = opt.id || `opt-${optIdx}`;
          const optCrit = (opt.criteria || [])[cIdx];
          scores[optId] = typeof optCrit?.score === 'number' ? optCrit.score : (opt.scores?.[cIdx] ?? 70);
          explanations[optId] = optCrit?.explanation || '';
        });
        return {
          id: `crit-${cIdx}`,
          name: c.name || `Criterion ${cIdx + 1}`,
          importanceWeight: typeof c.weight === 'number' ? c.weight : (data.options?.[0]?.weights?.[cIdx] ?? 7),
          scores,
          explanations,
        };
      });
      comparisonMatrix = {
        criteria,
        analysisSummary: data.summary || '',
      };
    } else {
      comparisonMatrix = {
        criteria: [],
        analysisSummary: data.summary || '',
      };
    }
  }

  // Reconstruct TiebreakerVerdict
  let verdictObj: TiebreakerVerdict = data.verdictDetails;
  if (!verdictObj || typeof verdictObj !== 'object') {
    const verdictName = typeof data.verdict === 'string' ? data.verdict : (options[0]?.name || 'Recommended Option');
    const matchingOpt = options.find((o) => o.name.toLowerCase() === verdictName.toLowerCase());
    verdictObj = {
      recommendedOptionId: matchingOpt?.id || options[0]?.id || 'opt-0',
      recommendedOptionName: verdictName,
      confidenceScore: typeof matchingOpt?.score === 'number' && matchingOpt.score > 0 ? matchingOpt.score : 85,
      theTiebreakerFactor: data.summary || '',
      coreReasoning: data.summary || '',
      regretMinimizationCheck: '',
      gutCheckQuestion: '',
      actionPlan: [],
      criticalRisksToWatch: [],
    };
  }

  return {
    id: data.id || docId,
    createdAt: createdAtStr,
    title: data.title || 'Untitled Decision',
    context: data.context || '',
    options,
    comparisonMatrix,
    swotAnalysis: data.swotAnalysis || {},
    verdict: verdictObj,
    language: data.language || 'en',
    translatedTo: data.translatedTo,
    originalVersion: data.originalVersion,
    feedback: data.feedback || {},
  };
}

/**
 * Saves or updates a decision analysis document in Firestore for the authenticated user.
 * Document is stored in the 'decisions' collection with:
 * - userId (string, the current user's UID)
 * - title (string, e.g. 'Job Offer A vs. Job Offer B')
 * - options (array of objects with option names, criteria, weights, and scores)
 * - verdict (string, the final recommendation/winner)
 * - summary (short explanation of why it won)
 * - createdAt (server timestamp)
 */
export async function saveDecisionToFirestore(
  userId: string,
  decision: DecisionAnalysisResult
): Promise<void> {
  const path = `decisions/${decision.id}`;
  try {
    const docRef = doc(db, 'decisions', decision.id);

    // Structure options array with option names, criteria, weights, and scores
    const options = (decision.options || []).map((opt) => {
      const criteria = (decision.comparisonMatrix?.criteria || []).map((c) => ({
        name: c.name,
        weight: c.importanceWeight,
        score: c.scores?.[opt.id] ?? 0,
        explanation: c.explanations?.[opt.id] || '',
      }));

      return {
        id: opt.id,
        name: opt.name,
        score: opt.score,
        criteria,
        weights: criteria.map((c) => c.weight),
        scores: criteria.map((c) => c.score),
        summary: opt.summary || '',
        pros: opt.pros || [],
        cons: opt.cons || [],
      };
    });

    // Extract recommendation / winner name as string
    const verdict =
      typeof decision.verdict === 'string'
        ? decision.verdict
        : decision.verdict?.recommendedOptionName || '';

    // Extract short summary of why it won
    const summary =
      decision.verdict?.theTiebreakerFactor ||
      decision.verdict?.coreReasoning ||
      decision.comparisonMatrix?.analysisSummary ||
      '';

    const rawPayload = {
      id: decision.id,
      userId,
      title: decision.title || 'Untitled Decision',
      options,
      verdict,
      summary,
      createdAt: serverTimestamp(),
      // Rich metadata to support full interactive views upon retrieval
      context: decision.context || '',
      comparisonMatrix: decision.comparisonMatrix || { criteria: [], analysisSummary: '' },
      swotAnalysis: decision.swotAnalysis || {},
      verdictDetails: typeof decision.verdict === 'object' ? decision.verdict : null,
      language: decision.language || 'en',
      translatedTo: decision.translatedTo || null,
      feedback: decision.feedback || {},
    };

    const payload = sanitizeForFirestore(rawPayload);

    await setDoc(docRef, payload, { merge: true });

    // Also mirror to user subcollection for backwards compatibility
    try {
      const legacyRef = doc(db, 'users', userId, 'decisions', decision.id);
      await setDoc(legacyRef, payload, { merge: true });
    } catch {
      // Non-blocking fallback
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all saved decisions for a given user from Firestore.
 */
export async function getDecisionsFromFirestore(
  userId: string
): Promise<DecisionAnalysisResult[]> {
  const path = 'decisions';
  try {
    const colRef = collection(db, 'decisions');
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const decisions: DecisionAnalysisResult[] = [];

    snapshot.forEach((docSnap) => {
      decisions.push(mapFirestoreDocToDecision(docSnap.id, docSnap.data()));
    });

    // If empty, check legacy user subcollection
    if (decisions.length === 0) {
      try {
        const legacyRef = collection(db, 'users', userId, 'decisions');
        const legacySnapshot = await getDocs(legacyRef);
        legacySnapshot.forEach((docSnap) => {
          decisions.push(mapFirestoreDocToDecision(docSnap.id, docSnap.data()));
        });
      } catch {
        // Ignore legacy fallback errors
      }
    }

    // Sort descending by createdAt
    return decisions.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Deletes a saved decision from Firestore.
 */
export async function deleteDecisionFromFirestore(
  userId: string,
  decisionId: string
): Promise<void> {
  const path = `decisions/${decisionId}`;
  try {
    const docRef = doc(db, 'decisions', decisionId);
    await deleteDoc(docRef);

    // Also delete from legacy subcollection if present
    try {
      const legacyRef = doc(db, 'users', userId, 'decisions', decisionId);
      await deleteDoc(legacyRef);
    } catch {
      // Non-blocking
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time updates of user decisions from Firestore.
 */
export function subscribeToUserDecisions(
  userId: string,
  onUpdate: (decisions: DecisionAnalysisResult[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'decisions';
  const colRef = collection(db, 'decisions');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const decisions: DecisionAnalysisResult[] = [];
      snapshot.forEach((docSnap) => {
        decisions.push(mapFirestoreDocToDecision(docSnap.id, docSnap.data()));
      });

      decisions.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });
      onUpdate(decisions);
    },
    (error) => {
      console.warn('[Firestore] Decisions subscription error:', error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

/**
 * Saves rating feedback for an analysis view of a decision.
 */
export async function saveDecisionFeedback(
  userId: string | null,
  decisionId: string,
  tab: string,
  feedbackItem: InsightFeedbackItem
): Promise<void> {
  // Strip any undefined values to ensure Firestore compliance
  const cleanItem = sanitizeForFirestore(feedbackItem);

  // Always persist locally
  try {
    const localKey = `arbitr_feedback_${decisionId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '{}');
    existing[tab] = cleanItem;
    localStorage.setItem(localKey, JSON.stringify(existing));
  } catch (err) {
    console.warn('[Feedback] Failed to save feedback locally:', err);
  }

  // If user is authenticated, sync to Firestore
  if (userId) {
    try {
      const docRef = doc(db, 'decisions', decisionId);
      const payload = sanitizeForFirestore({
        feedback: {
          [tab]: cleanItem,
        },
      });
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Failed to sync feedback to cloud:', err);
    }
  }
}

/**
 * Removes rating feedback for an analysis view of a decision.
 */
export async function removeDecisionFeedback(
  userId: string | null,
  decisionId: string,
  tab: string
): Promise<void> {
  // Update local storage
  try {
    const localKey = `arbitr_feedback_${decisionId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '{}');
    delete existing[tab];
    localStorage.setItem(localKey, JSON.stringify(existing));
  } catch (err) {
    console.warn('[Feedback] Failed to remove feedback locally:', err);
  }

  // If user is authenticated, remove from Firestore
  if (userId) {
    try {
      const docRef = doc(db, 'decisions', decisionId);
      await updateDoc(docRef, {
        [`feedback.${tab}`]: deleteField(),
      });
    } catch (err) {
      console.warn('[Firestore] Failed to remove feedback from cloud:', err);
    }
  }
}

/**
 * Retrieves saved rating feedback for a specific decision view tab.
 */
export function getDecisionFeedback(decisionId: string, tab: string): InsightFeedbackItem | null {
  try {
    const localKey = `arbitr_feedback_${decisionId}`;
    const stored = JSON.parse(localStorage.getItem(localKey) || '{}');
    return stored[tab] || null;
  } catch {
    return null;
  }
}
