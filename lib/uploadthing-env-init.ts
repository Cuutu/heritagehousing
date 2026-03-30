/** Debe importarse antes que `uploadthing/next` para que el SDK no falle al decodificar el token en `next build`. */

const placeholder = Buffer.from(
  JSON.stringify({
    apiKey: "sk_placeholder_build_only",
    appId: "placeholder",
    regions: ["auto"],
  })
).toString("base64");

const raw = process.env.UPLOADTHING_TOKEN;
let token = placeholder;
if (raw) {
  try {
    const decoded = JSON.parse(
      Buffer.from(raw, "base64").toString("utf8")
    ) as { apiKey?: string; appId?: string };
    if (decoded.apiKey?.startsWith("sk_") && decoded.appId) {
      token = raw;
    }
  } catch {
    token = placeholder;
  }
}
process.env.UPLOADTHING_TOKEN = token;

export {};
