import { User } from '@prisma/client';
import prisma from '@config/prisma.config';
import errorHandler from '@utils/errors/decorators/errorHandler.util';

interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterBy?: string;
  filterValue?: string;
}
export default class UserService {
  @errorHandler
  async getAllUsers(params: GetUsersParams) {
    const { page = 1, limit = 10 } = params;
    // const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filterBy = '', filterValue = '' } = params;

    // const offset = (Number(page) - 1) * Number(limit);
    const users = await prisma.user.findMany({});

    const totalUsers = await prisma.user.count({
      // where: {
      //   [filterBy]: {
      //     contains: filterValue,
      //     mode: 'insensitive',
      //   },
      // },
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      currentPage: page,
      totalPages,
      totalResults: totalUsers,
    };
  }

  @errorHandler
  async createUser(data: User): Promise<User> {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }

  @errorHandler
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  @errorHandler
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  @errorHandler
  async updateUser(id: string, data: User): Promise<User | null> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return user;
  }

  @errorHandler
  async deactivateUser(id: string): Promise<User | null> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
    return user;
  }
}
