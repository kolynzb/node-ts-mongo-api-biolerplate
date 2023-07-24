import BaseService from '@utils/api/BaseService.util';
import errorHandler from '@utils/errors/decorators/errorHandler.util';
import mongoose from 'mongoose';
import User, { UserDocument } from 'src/models/user.model';

export class UserService extends BaseService<UserDocument> {
  constructor() {
    super(User);
  }

  @errorHandler
  async deactivateUser(id: string): Promise<mongoose.UpdateWriteOpResult | null> {
    const user = await User.updateOne({
      id,
      data: {
        active: false,
      },
    });
    return user;
  }
}
