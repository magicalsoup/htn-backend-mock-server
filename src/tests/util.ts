import { yoga } from "../server"
import { readFileSync } from "fs"

const API_ENDPOINT = 'http://127.0.0.1:4000'

export const ALL_USER_DATA = JSON.parse(readFileSync("./prisma/mockUserData.json", 'utf-8'));

export async function executeQuery(query: string, type: string) {
    const result = await yoga.fetch(API_ENDPOINT, {
        method: type,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query
        })
    })
    return result
} 
