export const capitalizeFirstLetter = (line: string): string => (
  typeof line === 'string' && line.length
    ? `${line.charAt(0).toUpperCase()}${line.slice(1)}`
    : ''
);
