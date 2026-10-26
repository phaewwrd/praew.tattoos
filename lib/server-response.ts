export type ServerSuccess<T> = {
  ok: true;
  data: T;
};

export type FailureCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SLOT_UNAVAILABLE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ServerFailure = {
  ok: false;
  code: FailureCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ServerResponse<T> = ServerSuccess<T> | ServerFailure;

export function success<T>(data: T): ServerSuccess<T> {
  return { ok: true, data };
}

export function failure(
  code: FailureCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ServerFailure {
  return { ok: false, code, message, fieldErrors };
}

/** Throw inside an action handler to return a typed failure to the client. */
export class ActionError extends Error {
  constructor(
    readonly code: FailureCode,
    message: string,
  ) {
    super(message);
  }
}
