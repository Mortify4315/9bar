import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

export function startStaticServer(port = 20129) {
  const distDir = path.resolve(__dirname, "..", "..", "dist");

  const server = http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end("Method Not Allowed");
      return;
    }

    let reqPath;
    try {
      reqPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request");
      return;
    }

    if (reqPath === "/" || reqPath === "") reqPath = "/index.html";

    const filePath = path.resolve(distDir, reqPath.replace(/^[/\\]+/, ""));
    const relative = path.relative(distDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    const send = (status, contentType, data) => {
      res.writeHead(status, { "Content-Type": contentType });
      res.end(req.method === "HEAD" ? undefined : data);
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(distDir, "index.html"), (err2, indexData) => {
          if (err2) {
            send(404, "text/plain", "9Bar UI not built. Run 'npm run build' first.");
          } else {
            send(200, "text/html", indexData);
          }
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      send(200, MIME_TYPES[ext] || "application/octet-stream", data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(server);
      } else {
        reject(err);
      }
    });
  });
}
