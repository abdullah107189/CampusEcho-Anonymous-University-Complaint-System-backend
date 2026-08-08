import { Router } from 'express';
import { uploadSingle } from '../../middleware/upload.middleware';
import { submit, track } from './complaint.controller';

const router = Router();

router.post('/', uploadSingle, submit);
router.get('/track/:trackingId', track);

export default router;