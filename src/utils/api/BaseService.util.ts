import mongoose from 'mongoose';
import { NextFunction } from 'express';
import catchAsync from '@utils/errors/decorators/catchAsync.util';
import APIFeatures from './APIFeatures.util';
import AppError from '@utils/errors/appError.util';
import HttpStatusCodes from './httpStatusCode.util';

/**
 * Base service class to provide common CRUD operations for a specific Mongoose model.
 *
 * @template T - The Mongoose model type.
 */
export default class BaseService<T> {
  /**
   * The Mongoose model associated with this service.
   */
  Model: mongoose.Model<T>;

  /**
   * Creates an instance of BaseService with the provided Mongoose model.
   *
   * @param {mongoose.Model<T>} Model - The Mongoose model associated with this service.
   */
  constructor(Model: mongoose.Model<T>) {
    this.Model = Model;
  }

  /**
   * Creates a new document in the database using the provided data.
   *
   * @param {T} data - The data to create the document.
   * @returns {Promise<T>} The created document.
   */
  @catchAsync()
  async createDoc(data: T) {
    const doc = await this.Model.create(data);
    return doc;
  }

  /**
   * Retrieves multiple documents from the database based on the provided query.
   *
   * @param {any} query - The query to filter and paginate the results.
   * @returns {Promise<{ results: number; data: T[] }>} An object containing the results and data.
   */
  @catchAsync()
  async getAll(query: any): Promise<{ results: number; data: T[] }> {
    const filterObj = {};

    const features = new APIFeatures(this.Model.find(filterObj), query).filter().limitFields().sort().paginate();

    const docs = await features.dbQuery;

    return {
      results: docs.length,
      data: docs,
    };
  }

  /**
   * Retrieves a single document from the database based on the provided ID.
   *
   * @param {string} id - The ID of the document to retrieve.
   * @param {NextFunction} next - The Express middleware function for error handling.
   * @param {mongoose.PopulateOptions} [popOptions] - Options to populate fields in the retrieved document.
   * @returns {Promise<T | void>} The retrieved document, or null if not found.
   */
  @catchAsync()
  async getOne(id: string, next: NextFunction, popOptions?: mongoose.PopulateOptions): Promise<T | void> {
    let baseQuery = this.Model.findById(id);
    let query = popOptions ? baseQuery.populate(popOptions) : baseQuery.lean();

    const doc = await query;

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc as T;
  }

  /**
   * Updates a document in the database based on the provided ID and update data.
   *
   * @param {string} id - The ID of the document to update.
   * @param {mongoose.UpdateQuery<T>} data - The data to update the document.
   * @param {NextFunction} next - The Express middleware function for error handling.
   * @returns {Promise<T | null>} The updated document, or null if the document was not found.
   */
  @catchAsync()
  async updateOne(id: string, data: mongoose.UpdateQuery<T>, next: NextFunction): Promise<T | void> {
    const doc = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc;
  }

  /**
   * Deletes a document from the database based on the provided ID.
   *
   * @param {string} id - The ID of the document to delete.
   * @param {NextFunction} next - The Express middleware function for error handling.
   * @returns {Promise<T | void>} The deleted document, or null if the document was not found.
   */
  @catchAsync()
  async deleteOne(id: string, next: NextFunction): Promise<T | void> {
    const doc = await this.Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError(`No Document with Id of ${id} found`, HttpStatusCodes.NOT_FOUND));

    return doc;
  }
}
