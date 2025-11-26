import { ACCESS_CODE } from "../api/api.js";

export function withCode(url) {
  if (!ACCESS_CODE) return url;
  return `${url}?code=${ACCESS_CODE}`;
}
