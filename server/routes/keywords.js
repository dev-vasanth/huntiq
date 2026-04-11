import express from 'express';
import { getKeywords, createKeyword, updateKeyword, deleteKeyword, toggleKeyword, suggestSubreddits } from '../controllers/keywordController.js';
import auth from '../middleware/auth.js';
import { checkKeywordLimit } from '../middleware/planLimits.js';

const router = express.Router();

router.use(auth);
router.get('/', getKeywords);
router.post('/', checkKeywordLimit, createKeyword);
router.put('/:id', updateKeyword);
router.delete('/:id', deleteKeyword);
router.post('/suggest-subreddits', suggestSubreddits);
router.patch('/:id/toggle', toggleKeyword);

export default router;
