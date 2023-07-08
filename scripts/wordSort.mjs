/* eslint-disable no-console */
import fs from 'fs';

/**
 * Sorts the words in a text file in alphabetical order.
 * Converts all words to lowercase.
 * @param  {string} filePath - The path to the text file.
 */
const sortWordsInFile = filePath => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const words = fileContent.toLowerCase().split('\n').filter(Boolean);
    const sortedWords = words.sort();
    const sortedContent = sortedWords.join('\n');
    fs.writeFileSync(filePath, sortedContent);
    console.log('File successfully sorted! 😉\nAll words are in lowercase.🤏🏿');
  } catch (error) {
    console.error('An error occurred while sorting the file:', error.message);
  }
};
// Usage Example
const filePath = process.argv[2] || './library/project-words.txt';
sortWordsInFile(filePath);
