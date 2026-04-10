import express from 'express';
import { getKeywords, createKeyword, updateKeyword, deleteKeyword, toggleKeyword } from '../controllers/keywordController.js';
import auth from '../middleware/auth.js';
import { checkKeywordLimit } from '../middleware/planLimits.js';

const router = express.Router();

router.use(auth);
router.get('/', getKeywords);
router.post('/', checkKeywordLimit, createKeyword);
router.put('/:id', updateKeyword);
router.delete('/:id', deleteKeyword);
router.patch('/:id/toggle', toggleKeyword);

export default router;
