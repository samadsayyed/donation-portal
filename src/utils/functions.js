export const generateReferenceId = () => {
  return Array(32)
    .fill(0)
    .map(() => "12345abcde"[Math.floor(Math.random() * 10)])
    .join("");
};
