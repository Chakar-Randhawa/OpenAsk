/**
 * Drafts Management Utility
 * Auto-saves questions and answers progress to browser local storage so user content
 * is preserved across accidental navigation, browser refresh, or tab closure.
 */

export interface QuestionDraft {
  title: string;
  body: string;
  selectedCategorySlug?: string;
  tagsInput?: string;
  isAnonymous?: boolean;
  updatedAt: string;
}

export interface AnswerDraft {
  questionId: string;
  body: string;
  isAnonymous?: boolean;
  updatedAt: string;
}

const QUESTION_DRAFT_KEY = 'openask_draft_question_v1';
const ANSWER_DRAFT_KEY_PREFIX = 'openask_draft_answer_v1_';

export const draftsManager = {
  /**
   * Saves question draft. If title and body are empty, cleans up the draft.
   */
  saveQuestionDraft(data: {
    title: string;
    body: string;
    selectedCategorySlug?: string;
    tagsInput?: string;
    isAnonymous?: boolean;
  }): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const title = data.title || '';
      const body = data.body || '';

      // If nothing has been typed, clean up storage
      if (!title.trim() && !body.trim()) {
        window.localStorage.removeItem(QUESTION_DRAFT_KEY);
        return;
      }

      const draft: QuestionDraft = {
        title,
        body,
        selectedCategorySlug: data.selectedCategorySlug,
        tagsInput: data.tagsInput,
        isAnonymous: data.isAnonymous,
        updatedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(QUESTION_DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('Unable to save question draft to localStorage:', err);
    }
  },

  /**
   * Retrieves saved question draft if exists and has content.
   */
  loadQuestionDraft(): QuestionDraft | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(QUESTION_DRAFT_KEY);
      if (!raw) return null;

      const draft: QuestionDraft = JSON.parse(raw);
      if (draft && (draft.title?.trim() || draft.body?.trim())) {
        return draft;
      }
      return null;
    } catch (err) {
      console.warn('Unable to parse question draft from localStorage:', err);
      return null;
    }
  },

  /**
   * Discards question draft.
   */
  clearQuestionDraft(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(QUESTION_DRAFT_KEY);
    } catch (err) {
      console.warn('Unable to clear question draft from localStorage:', err);
    }
  },

  /**
   * Saves answer draft for a specific question.
   */
  saveAnswerDraft(
    questionId: string,
    data: {
      body: string;
      isAnonymous?: boolean;
    }
  ): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage || !questionId) return;

      const key = `${ANSWER_DRAFT_KEY_PREFIX}${questionId}`;
      const body = data.body || '';

      // If body is empty, remove saved draft
      if (!body.trim()) {
        window.localStorage.removeItem(key);
        return;
      }

      const draft: AnswerDraft = {
        questionId,
        body,
        isAnonymous: data.isAnonymous,
        updatedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(key, JSON.stringify(draft));
    } catch (err) {
      console.warn('Unable to save answer draft to localStorage:', err);
    }
  },

  /**
   * Retrieves saved answer draft for a specific question.
   */
  loadAnswerDraft(questionId: string): AnswerDraft | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage || !questionId) return null;
      const key = `${ANSWER_DRAFT_KEY_PREFIX}${questionId}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const draft: AnswerDraft = JSON.parse(raw);
      if (draft && draft.body?.trim()) {
        return draft;
      }
      return null;
    } catch (err) {
      console.warn('Unable to parse answer draft from localStorage:', err);
      return null;
    }
  },

  /**
   * Discards answer draft for a specific question.
   */
  clearAnswerDraft(questionId: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage || !questionId) return;
      const key = `${ANSWER_DRAFT_KEY_PREFIX}${questionId}`;
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn('Unable to clear answer draft from localStorage:', err);
    }
  },
};
