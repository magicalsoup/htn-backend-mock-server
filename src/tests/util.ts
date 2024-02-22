import { User } from "../lib/types"
import { getUniqueSkills, ALL_USER_DATA } from "../lib/util"
import { yoga } from "../server"

const API_ENDPOINT = 'http://127.0.0.1:4000'

// so skills are unique, to match up with the database
export const MODIFIED_ALL_USER_DATA = ALL_USER_DATA.map((user: User) => {
    return {
        ...user,
        skills: getUniqueSkills(user.skills)
    }
})

export async function executeQuery(query: string, type: string) {
    const result = await yoga.fetch(API_ENDPOINT, {
        method: type,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query,
        })
    })
    return result
} 
