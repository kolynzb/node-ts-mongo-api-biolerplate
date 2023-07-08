/* eslint-disable no-console */
import { copy } from 'fs-extra';

const ANSIColorEscapeCodes = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

/**
 * Copies folders from the source directory to the destination directory.
 *
 * @param  {string} dir - The directory to be copied to the destination folder.
 * @returns  {Promise<void>} A Promise that resolves when the directory copy is completed successfully, or rejects with an error.
 */
const copyDirToBuild = dir => {
  console.log(
    `${ANSIColorEscapeCodes.yellow}.....Copying ./src/${dir.toUpperCase()} to ./dist..... ${
      ANSIColorEscapeCodes.reset
    }${ANSIColorEscapeCodes.dim}`,
  );

  return copy(`./src/${dir}`, `./dist/${dir}`)
    .then(() =>
      console.log(
        `${ANSIColorEscapeCodes.green}#####💯 ${dir.toUpperCase()} copied successfully 💯#####${
          ANSIColorEscapeCodes.reset
        }`,
      ),
    )
    .catch(error =>
      console.error(
        `${ANSIColorEscapeCodes.red}${dir.toUpperCase()} copy failed${ANSIColorEscapeCodes.reset} \n`,
        error.message,
      ),
    );
};

['views', 'templates', 'public'].forEach(dir => copyDirToBuild(dir));
