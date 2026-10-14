export type ServerSuccess<T> = {
  ok: true;
  data: T;
};

export type ServerFailure = {
  ok: false;
  code: "INVALID_INPUT" | "SLOT_UNAVAILABLE" | "INTERNAL_ERROR";
  message: string;
};

export type ServerResponse<T> = ServerSuccess<T> | ServerFailure;

export function success<T>(data: T): ServerSuccess<T> {
  return { ok: true, data };
}

export function failure(code: ServerFailure["code"], message: string): ServerFailure {
  return { ok: false, code, message };
}