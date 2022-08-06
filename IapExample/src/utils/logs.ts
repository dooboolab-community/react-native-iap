export const errorLog = ({
  message,
  error,
}: {
  message: string;
  error: unknown;
}) => {
  console.error('An error happened', message, error);
};
