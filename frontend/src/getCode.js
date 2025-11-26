export function getCode() {
  return new URLSearchParams(window.location.search).get("code");
}

export function withCode(path) {
  const code = getCode();
  if (!code) return path;
  return `${path}?code=${code}`;
}
