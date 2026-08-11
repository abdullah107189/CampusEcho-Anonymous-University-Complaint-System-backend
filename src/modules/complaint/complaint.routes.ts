import { Router } from 'express';
import { submit, track } from './complaint.controller';
import { uploadSingle } from '../../shared/middleware/upload.middleware';

const router = Router();

router.post('/', uploadSingle, submit);
router.get('/track/:trackingId', track);

export default router;