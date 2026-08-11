import { Router } from 'express';
import {
  getAllComplaints,
  getComplaint,
  updateStatus,
  assign,
  createNote,
  removeComplaint,
  dashboard,
} from './admin.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { roleMiddleware } from '../../shared/middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'staff']));

router.get('/dashboard', dashboard);
router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getComplaint);
router.patch('/complaints/:id/status', updateStatus);
router.patch('/complaints/:id/assign', roleMiddleware(['admin']), assign);
router.post('/complaints/:id/notes', createNote);
router.delete('/complaints/:id', roleMiddleware(['admin']), removeComplaint);

export default router;