module.exports = (x) => {
  if (x.path === 'subdir1/skip.txt') {
    throw new Error(`trigger an error`);
  }
  return x;
}
