import express from 'express';
import { getLeads, getLead, updateLeadStatus, deleteLead, scanNow, testScan, getLeadStats, exportLeads } from '../controllers/leadController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.get('/stats', getLeadStats);
router.get('/export', exportLeads);
router.get('/', getLeads);
router.get('/:id', getLead);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);
router.post('/scan', scanNow);
router.get('/scan/test', testScan);

export default router;
