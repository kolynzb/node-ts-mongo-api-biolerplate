import { Router } from 'express';
import { protect, restrictedTo } from '@middleware/auth.middleware';
import UserController from '@controllers/user/user.controller';

const router = Router();
const userController = new UserController();
router.use(protect);
router.route('/me').get(userController.getMe).patch(userController.updateMe).delete(userController.deactivateMe);

router.use(restrictedTo('ADMIN'));

/*
 * @example
 * GET /api/users?page=2&limit=10&sort=createdAt:desc&filter=firstName:John,lastName:Doe
 */
router.route('/').get(userController.getAllUsers);

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deactivateMe);

export default router;
