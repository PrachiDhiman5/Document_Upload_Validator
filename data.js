// In-memory seed data. Fresh copy per student store (see isolation.js).

function makeSeed() {
  const documents = [
    {
      id: 1,
      fileName: "pan_card.pdf",
      mimeType: "pdf",
      sizeKB: 240,
      docType: "PAN",
      status: "ACCEPTED",
      createdAt: "2026-07-01T09:00:00.000Z",
    },
    {
      id: 2,
      fileName: "payslip_june.jpg",
      mimeType: "jpg",
      sizeKB: 1800,
      docType: "PAYSLIP",
      status: "ACCEPTED",
      createdAt: "2026-07-02T10:00:00.000Z",
    },
    {
      id: 3,
      fileName: "degree_certificate.png",
      mimeType: "png",
      sizeKB: 3400,
      docType: "DEGREE",
      status: "ACCEPTED",
      createdAt: "2026-07-03T11:00:00.000Z",
    },
  ];

  return { documents, nextDocId: documents.length + 1 };
}

module.exports = { makeSeed };
