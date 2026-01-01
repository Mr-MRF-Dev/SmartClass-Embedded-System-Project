import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
config({ path: resolve(__dirname, "../.env") });

export default {
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/smartclassdb?schema=public",
    },
  },
};
