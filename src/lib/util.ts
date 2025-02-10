import { readFileSync } from "fs";

export const ALL_USER_DATA = JSON.parse(readFileSync("./prisma/mockUserData.json", 'utf-8'))