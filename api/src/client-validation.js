import { isIP } from 'node:net';

export function normalizeNit(value) {
  const compact = (value ?? '').replace(/[\s-]+/gu, '').toUpperCase();
  if (compact === '' || compact === 'CF') return null;
  return compact.replace(/^0+/, '') || '0';
}

export function validNit(value) {
  if (!/^[1-9][0-9]{0,10}[0-9K]$/.test(value)) return false;
  let sum = 0;
  [...value.slice(0, -1)].reverse().forEach((digit, index) => { sum += Number(digit) * (index + 2); });
  const digit = (11 - sum % 11) % 11;
  return value.at(-1) === (digit === 10 ? 'K' : String(digit));
}

export function normalizePhone(value) {
  const compact = value.replace(/[\s.()\-]+/gu, '');
  if (compact.startsWith('+502')) return compact.slice(4);
  return compact.length === 11 && compact.startsWith('502') ? compact.slice(3) : compact;
}

export function validateClient(body, partial = false) {
  const data = Object.create(null), errors = Object.create(null);
  for (const field of Object.keys(body)) {
    if (!['nombre', 'nit', 'telefono', 'correo'].includes(field)) errors[field] = 'Este campo no está permitido.';
  }
  for (const field of ['nombre', 'nit', 'telefono', 'correo']) {
    if (!Object.hasOwn(body, field) && (partial || field === 'correo')) continue;
    let value = body[field];
    if (typeof value === 'string') value = value.trim();
    if (field === 'nombre') {
      if (typeof value === 'string') value = value.replace(/\s+/gu, ' ');
      if (typeof value !== 'string' || value.length === 0 || [...value].length > 150) errors[field] = 'Ingrese un nombre de hasta 150 caracteres.';
    } else if (field === 'nit') {
      if (value !== null && typeof value !== 'string') errors[field] = 'Ingrese un NIT válido o CF.';
      else { value = normalizeNit(value); if (value !== null && !validNit(value)) errors[field] = 'Ingrese un NIT válido con su dígito verificador o CF.'; }
    } else if (field === 'telefono') {
      if (typeof value === 'string') value = normalizePhone(value);
      if (typeof value !== 'string' || !/^[2-9][0-9]{7}$/.test(value)) errors[field] = 'Ingrese ocho dígitos que comiencen de 2 a 9.';
    } else {
      if (value === '' || value === null || value === undefined) value = null;
      else if (typeof value !== 'string' || [...value].length > 150 || !validEmail(value)) errors[field] = 'Ingrese un correo electrónico válido de hasta 150 caracteres.';
    }
    data[field] = value;
  }
  return { data, errors };
}

export function validEmail(value) {
  const at = value.lastIndexOf('@');
  if (at <= 0) return false;
  const local = value.slice(0, at), domain = value.slice(at + 1);
  const quoted = /^"(?:[^"\\\r\n]|\\[^\r\n])*"$/u.test(local);
  if (!quoted && (!/^[\p{L}\p{N}\p{M}!#$%&'*+/=?^_`{|}~.-]+$/u.test(local)
    || local.startsWith('.') || local.endsWith('.') || local.includes('..'))) return false;
  if (domain.startsWith('[') && domain.endsWith(']')) return isIP(domain.slice(1, -1).replace(/^IPv6:/i, '')) !== 0;
  return domain.replace(/\.$/, '').split('.').every(label => /^[\p{L}\p{N}\p{M}](?:[\p{L}\p{N}\p{M}-]*[\p{L}\p{N}\p{M}])?$/u.test(label));
}
