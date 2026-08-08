export const successResponse = <T>(message: string, data?: T) => {
  return {
    success: true,
    message,
    ...(data && { data }),
  };
};

export const errorResponse = (message: string, statusCode: number = 400) => {
  return {
    success: false,
    message,
    statusCode,
  };
};