import { User } from "../lib/types"
import { getUniqueSkills } from "../lib/util"
import { yoga } from "../server"
import { readFileSync } from "fs"

const API_ENDPOINT = 'http://127.0.0.1:4000'

// so skills are unique, which lines up with the database
export const MODIFIED_ALL_USER_DATA = JSON.parse(readFileSync("./prisma/mockUserData.json", 'utf-8')).map((user: User) => {
    return {
        ...user,
        skills: getUniqueSkills(user.skills)
    }
})

export const EVENT_DATA = JSON.parse(readFileSync("./prisma/mockEventData.json", 'utf-8'))

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
