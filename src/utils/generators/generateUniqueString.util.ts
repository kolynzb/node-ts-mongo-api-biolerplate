import slugify from 'slugify';

const generateUniqueSlug = (baseString: string): string => {
  const timestamp = Date.now().toString(); // Get the current timestamp
  const randomString = Math.random().toString(36).slice(2, 5); // Generate a random string

  const sanitizedString = slugify(baseString, {
    lower: true,
    strict: true,
  });

  return `${sanitizedString}-${timestamp}-${randomString}`;
};

export default generateUniqueSlug;
