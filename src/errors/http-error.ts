export interface ErrorDetail {
  field: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string, details?: ErrorDetail[]) {
    return new HttpError(400, message, details);
  }

  static notFound(message: string) {
    return new HttpError(404, message);
  }
}
