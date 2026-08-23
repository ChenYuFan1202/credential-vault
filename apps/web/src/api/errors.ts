export function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
  statusMessages: Record<number, string> = {},
): string {
  return statusMessages[response.status] ?? fallbackMessage;
}

export function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Cannot connect to the API. Please make sure the backend is running.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}
