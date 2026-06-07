import { Router } from 'express';
import { protect, requireRole, requireVerifiedInvestor } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import * as auth from '../controllers/authController.js';
import * as ideas from '../controllers/ideaController.js';
import * as uploads from '../controllers/uploadController.js';
import * as investments from '../controllers/investmentController.js';
import * as subs from '../controllers/subscriptionController.js';
import * as connections from '../controllers/connectionController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

/* ===== Auth ===== */
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);
router.put('/auth/profile', protect, upload.single('avatar'), auth.updateProfile);

/* ===== Uploads ===== */
router.post('/uploads', protect, upload.single('file'), uploads.uploadFile);
router.post('/uploads/verification', protect, upload.single('document'), uploads.uploadVerification);

/* ===== Ideas =====
   Creators manage their own; investors must be verified to browse. */
router.get('/ideas/mine', protect, requireRole('creator', 'admin'), ideas.myIdeas);
router.post('/ideas', protect, requireRole('creator', 'admin'),
  upload.fields([{ name: 'coverImage' }, { name: 'backgroundImage' }]), ideas.createIdea);
router.put('/ideas/:id', protect, requireRole('creator', 'admin'),
  upload.fields([{ name: 'coverImage' }, { name: 'backgroundImage' }]), ideas.updateIdea);
router.delete('/ideas/:id', protect, ideas.deleteIdea);

// Browsing marketplace — verified investors / admin only
router.get('/ideas', protect, requireVerifiedInvestor, ideas.listIdeas);
router.get('/ideas/:id', protect, requireVerifiedInvestor, ideas.getIdea);

/* ===== Investments ===== */
router.post('/investments/order', protect, requireVerifiedInvestor, investments.createInvestmentOrder);
router.post('/investments/verify', protect, requireVerifiedInvestor, investments.verifyInvestment);
router.get('/investments/mine', protect, investments.myInvestments);
router.get('/investments/received', protect, requireRole('creator', 'admin'), investments.receivedInvestments);
router.post('/investments/:id/payout', protect, requireRole('creator', 'admin'), investments.recordPayout);
router.put('/investments/:id/mature', protect, requireRole('creator', 'admin'), investments.markMatured);

/* ===== Subscriptions ===== */
router.get('/subscriptions/plans', subs.getPlans);
router.post('/subscriptions/order', protect, subs.createSubscriptionOrder);
router.post('/subscriptions/verify', protect, subs.verifySubscription);

/* ===== Connections ===== */
router.post('/connections', protect, requireVerifiedInvestor, connections.createConnection);
router.get('/connections/mine', protect, connections.myConnections);
router.get('/connections/received', protect, requireRole('creator', 'admin'), connections.receivedConnections);
router.put('/connections/:id', protect, connections.respondConnection);

/* ===== Admin ===== */
router.get('/admin/investors', protect, requireRole('admin'), admin.listInvestors);
router.get('/admin/creators', protect, requireRole('admin'), admin.listCreators);
router.put('/admin/investors/:id/verify', protect, requireRole('admin'), admin.setVerification);
router.get('/admin/stats', protect, requireRole('admin'), admin.stats);

export default router;
