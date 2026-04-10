import express from 'express';
import { getDigestSettings, updateDigestSettings, sendTestDigest } from '../controllers/digestController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);
router.get('/settings', getDigestSettings);
router.put('/settings', updateDigestSettings);
router.post('/test', sendTestDigest);

export default router;
