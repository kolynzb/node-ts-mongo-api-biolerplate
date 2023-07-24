import mongoose from 'mongoose';
import { NextFunction } from 'express';
import catchAsync from '@utils/errors/decorators/catchAsync.util';
import APIFeatures from './APIFeatures.util';
import AppError from '@utils/errors/appError.util';
import HttpStatusCodes from './httpStatusCode.util';

export default class BaseService<T> {

  Model: mongoose.Model<T>;

  constructor(Model: mongoose.Model<T>) {
    this.Model = Model;
  }

  @catchAsync()
  async createDoc(data: T) {
    const doc = await this.Model.create(data);
    return doc;
  }

  @catchAsync()
  async getAll(query: any) {
    const filterObj = {};

    const features = new APIFeatures(this.Model.find(filterObj), query).filter().limitFields().sort().paginate();

    const docs = await features.dbQuery;

    return {
      results: docs.length,
      data: docs,
    };
  }

  @catchAsync()
  async getOne(id: string, next: NextFunction, popOptions?: mongoose.PopulateOptions) {
    let baseQuery = this.Model.findById(id);
    let query = popOptions ? baseQuery.populate(popOptions) : baseQuery;

    const doc = await query;

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc;
  }

  @catchAsync()
  async updateOne(id: string, data: mongoose.UpdateQuery<T>, next: NextFunction) {
    const doc = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc;
  }

  @catchAsync()
  async deleteOne(id: string, next: NextFunction) {
    const doc = await this.Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc;
  }
}
