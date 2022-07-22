export const dashesToCamelCase = input =>
input
  .split("-")
  .reduce(
    (res, word, i) =>
      i === 0
        ? word.toLowerCase()
        : `${res}${word.charAt(0).toUpperCase()}${word
            .substr(1)
            .toLowerCase()}`,
    ""
);