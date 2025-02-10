import { Scan, User } from "../lib/types"
import { ALL_USER_DATA } from "../lib/util"
import { yoga } from "../server"

const API_ENDPOINT = 'http://127.0.0.1:4000'

// fix scanned_at iso time formats to match up with the database
export const MODIFIED_ALL_USER_DATA = ALL_USER_DATA.map((user: User) => {
    return {
        ...user,
        scans: user.scans.map((scan) => {
            return {
                activity_name: scan.activity_name,
                activity_category: scan.activity_category,
                scanned_at: new Date(scan.scanned_at).toISOString()
            }
        })
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

// db not guaranteed to get scans in the same order as the mockuserData, lets sort them then compare
// we also exclude the updatedAt field (not reversible) as those can change from other tests
export function sortUserByScannedAt(user: User) {
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        badge_code: user.badge_code,
        scans: user.scans.toSorted((a: Scan, b: Scan) => a.scanned_at < b.scanned_at? -1 : 1)
    }
}

// same function as above but for multiple users
export function sortUsersByScannedAt(users: User[]) {
    return users.map((user) => {
        return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            badge_code: user.badge_code,
            scans: user.scans.toSorted((a: Scan, b: Scan) => a.scanned_at < b.scanned_at? -1 : 1)
        }
    })
}
