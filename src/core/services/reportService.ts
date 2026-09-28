import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { ReportItem } from '../models/types';

const REPORTS_COLLECTION = 'reports';

export const reportService = {
  async submitReport(
    reporterUid: string,
    targetType: 'question' | 'answer' | 'user' | 'comment',
    targetId: string,
    reason: string,
    details: string
  ): Promise<void> {
    const reportId = 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const report: ReportItem = {
      reportId,
      reporterUid,
      targetType,
      targetId,
      reason,
      details: details.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, REPORTS_COLLECTION, reportId), report);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${REPORTS_COLLECTION}/${reportId}`);
    }
  }
};
