
const urlParams = new URLSearchParams(window.location.search);
const urlCode = urlParams.get("code");


if (urlCode) {
  localStorage.setItem("ACCESS_CODE", urlCode);
}


export const ACCESS_CODE = localStorage.getItem("ACCESS_CODE") || null;





const API_BASE = "https://lecture-mvp2-1.onrender.com";




async function apiFetch(endpoint, options = {}) {
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "X-ACCESS-CODE": ACCESS_CODE,
      ...(options.headers || {}),
    },
  }).then((res) => res.json());
}




export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/transcribe", {
    method: "POST",
    body: formData,
  });
}

export async function getHistory() {
  return apiFetch("/history");
}

export async function getLecture(id) {
  return apiFetch(`/lecture/${id}`);
}

export async function deleteLecture(id) {
  return apiFetch(`/lecture/${id}`, {
    method: "DELETE",
  });
}

