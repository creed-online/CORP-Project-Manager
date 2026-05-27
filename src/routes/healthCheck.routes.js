import {Router} from 'express';
import { healthCheck } from '../controllers/healthCheck.controller.js';

const router = Router();

router.route('/').get(healthCheck);
router.route('/health').get(healthCheck);

export default router; 