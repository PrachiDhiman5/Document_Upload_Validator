function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast" + (type === "error" ? " error" : "");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function renderDocuments(docs) {
  const tbody = document.getElementById("documents-tbody");
  tbody.innerHTML = docs
    .map((d) => {
      const badgeClass = d.status === "ACCEPTED" ? "rejected" : "accepted";
      return `
        <tr data-id="${d.id}">
          <td>${d.id}</td>
          <td>${d.fileName}</td>
          <td>${d.mimeType}</td>
          <td>${d.sizeKB} MB</td>
          <td>${d.docType}</td>
          <td><span class="badge ${badgeClass}">${d.status}</span></td>
          <td><button class="danger row-delete" type="button">Delete</button></td>
        </tr>`;
    })
    .join("");

  tbody.querySelectorAll(".row-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
    });
  });
}

async function loadDocuments() {
  const res = await fetch("/api/documents");
  const data = await res.json();
  renderDocuments(data);
}

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileName = document.getElementById("fileName").value;
  const mimeType = document.getElementById("mimeType").value;
  const sizeKB = parseInt(document.getElementById("sizeKB").value, 10);
  const docType = document.getElementById("docType").value;

  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, mimeType, sizeKB, docType }),
  });

  showToast("Document uploaded successfully!", "success");

  loadDocuments();
});

// --- Interviewer/candidate tooling: reset seed data (not part of the app-under-test) ---
document.getElementById("reset-data-btn").addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  loadDocuments();
  showToast("Data reset", "success");
});

loadDocuments();
