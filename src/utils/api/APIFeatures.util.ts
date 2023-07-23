/**
 * APIFeatures class for handling API query features such as filtering, sorting, field limiting, and pagination.
 *
 * This class provides methods for manipulating query parameters from the request URL to modify database queries using Mongoose.
 */
// TODO: Document Usage
// TODO: Add types
class APIFeatures {
  dbQuery: any;

  queryString: any;

  /**
   * Creates an instance of the APIFeatures class.
   * @param {any} dbQuery - The Mongoose query object.  `Model.find()`
   * @param {any} queryString - The query parameters from the request URL. From `req.query`
   */
  constructor(dbQuery: any, queryString: any) {
    this.dbQuery = dbQuery;
    this.queryString = queryString;
  }

  /**
   * Filters the query based on query parameters in the request URL.
   * @returns {APIFeatures} - The current APIFeatures instance for method chaining.
   */
  filter(): APIFeatures {
    const queryObject = { ...this.queryString };
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`); // search for gte and replace with $gte

    this.dbQuery = this.dbQuery.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * Sorts the query based on query parameters in the request URL.
   * @returns {APIFeatures} - The current APIFeatures instance for method chaining.
   */
  sort(): APIFeatures {
    if (this.queryString.sort) {
      this.dbQuery = this.dbQuery.sort(this.queryString.sort);
    } else {
      this.dbQuery = this.dbQuery.sort('-createdAt');
    }
    return this;
  }

  /**
   * Limits the fields returned in the query based on query parameters in the request URL.
   * @returns {APIFeatures} - The current APIFeatures instance for method chaining.
   */
  limitFields(): APIFeatures {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.dbQuery = this.dbQuery.select(fields);
    } else {
      this.dbQuery = this.dbQuery.select('--v'); // exclude -v
    }
    return this;
  }

  /**
   * Paginates the query based on query parameters in the request URL.
   * @returns {APIFeatures} - The current APIFeatures instance for method chaining.
   */
  paginate(): APIFeatures {
    const n = 100;
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || n; // number of results
    const skip = (page - 1) * limit;
    this.dbQuery = this.dbQuery.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
