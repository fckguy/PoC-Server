export const stringMiddleEllipsis = ({ text, len = 4 }: { text: string; len?: number }) => {
  if (!text) {
    return '';
  }
  return `${text.substr(0, len)}...${text.substr(text.length - len, text.length)}`;
};
