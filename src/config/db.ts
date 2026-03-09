import { JsonDB, Config } from "node-json-db";
import path from "path";

const db = new JsonDB(new Config(path.join(process.cwd(), "data", "db"), true, true, "/"));

export default db;
