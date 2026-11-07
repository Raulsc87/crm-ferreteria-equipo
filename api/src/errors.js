export function fail(status, message) {
  throw Object.assign(new Error(message), { status, publicError: true });
}

export function invalid(errors) {
  throw Object.assign(new Error('Revise los datos enviados.'), { status: 422, publicError: true, errors });
}
