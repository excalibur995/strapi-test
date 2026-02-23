const http = require("http");

const PORT = 4000;

const MOCK_DB = {
  "user-001": { hasCreditCard: true, hasAnyBankProduct: true },
  "user-002": { hasCreditCard: false, hasAnyBankProduct: false },
  "user-003": { hasCreditCard: true, hasAnyBankProduct: true },
};

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/user/status") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { userId } = JSON.parse(body);
        const userData = MOCK_DB[userId];

        res.setHeader("Content-Type", "application/json");
        if (userData) {
          res.writeHead(200);
          res.end(JSON.stringify(userData));
        } else {
          // Return null as per requirements if user not found,
          // or we could return 404. Requirement says "Return ... null if userId is not found".
          // Usually API returns 200 with null body or 404.
          // Let's assume 200 with null body for "graceful" handling in service?
          // The service checks `if (kycApiUrl && kycApiKey)` effectively but the response merging logic:
          // `externalData = response.data;`
          // If we return null literal:
          res.writeHead(200);
          res.end(JSON.stringify(null));
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Mock KYC API server running at http://localhost:${PORT}`);
});
