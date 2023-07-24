import { NextFunction, Request, Response } from 'express';
import UserService from '@services/user/user.service';
import catchAsync from '@utils/errors/decorators/catchAsync.util';
import { RequestWithUser } from '@interfaces/user.interface';
import { UserDocument } from 'src/models/user.model';
import HttpStatusCodes from '@utils/api/httpStatusCode.util';

const userService = new UserService();

class UserController {
  @catchAsync()
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const result = await userService.getAll(req.query);

    return res.status(HttpStatusCodes.OK).json({
      status: 'success',
      results: result.results,
      data: result.data,
    });
  }

  @catchAsync()
  async deactivateMe(req: Request, res: Response, next: NextFunction) {
    const userId = ((req as RequestWithUser)?.user as UserDocument).id;

    await userService.deactivateUser(userId);
    return res.status(HttpStatusCodes.NO_CONTENT).json({
      status: 'success',
    });
  }

  @catchAsync()
  async getMe(req: Request, res: Response, next: NextFunction) {
    const userId = ((req as RequestWithUser)?.user as UserDocument).id;

    const user = await userService.getOne(userId, next);
    return res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: user as UserDocument,
    });
  }

  @catchAsync()
  async updateMe(req: Request, res: Response, next: NextFunction) {
    const userId = ((req as RequestWithUser)?.user as UserDocument).id;
    const userData = req.body;

    const user = await userService.updateOne(userId, userData, next);
    return res.status(200).json({ status: 'success', message: 'Updated successfully ', data: user });
  }

  @catchAsync()
  async updateUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    const userData = req.body;

    const user = await userService.updateOne(userId, userData, next);
    return res.status(200).json({ status: 'success', message: 'User successfully updated', data: user });
  }

  @catchAsync()
  async getUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    const user = await userService.getOne(userId, next);
    return res.status(200).json({ status: 'success', data: user });
  }
}

export default UserController;
