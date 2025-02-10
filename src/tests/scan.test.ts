import {describe, expect, test} from "@jest/globals"
import { server } from "../server"
import { executeQuery, MODIFIED_ALL_USER_DATA } from "./util";


// put in here instead of util because it's specific for scan tests
function getAllActivitiesWithFilter(min_frequency?: number, max_frequency?: number, activity_category?: string) {
    let frequency = new Map<string, number>()
    for (const user of MODIFIED_ALL_USER_DATA) {
        for (const scan of user.scans) {
            let filter = activity_category? activity_category == scan.activity_category : true;
            if (filter) {
                frequency.set(scan.activity_name, (frequency.get(scan.activity_name)?? 0) + 1)
            }
        }
    }
    let result: any[] = []
    frequency.forEach((freq, activity_name) => {
        const filter = min_frequency? freq >= min_frequency : true &&
                       max_frequency? freq <= max_frequency : true
        if (filter) {
            result.push({
                activity_name: activity_name,
                _count: {
                    _all: freq
                }
            })
        }
    })
    result.sort((r1, r2) => {
        if (r1.activity_name < r2.activity_name) {
            return -1;
        } 
        if (r1.activity_name > r2.activity_name) {
            return 1;
        }
        return 0;
    })
    return result;
}

describe('get scan frequency endpoint', () => {
    test('test if the frequency count for the scan is correct', async () => {
        const query = `query {
            scans(min_frequency: 5, activity_category: "meal") {
                activity_name
                _count {
                    _all
                }
            }
        }`
        const expected = getAllActivitiesWithFilter(5, undefined, "meal");
        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.scans).toEqual(expected))
    })
    test('test if the frequency count for the scan is correct supplying different filters 1', async () => {
        const query = `query {
            scans(min_frequency: 5, max_frequency: 20) {
                activity_name
                _count {
                    _all
                }
            }
        }`
        const expected = getAllActivitiesWithFilter(5, 20, undefined);
        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.scans).toEqual(expected))
    })
    test('test if the frequency count for the scan is correct supplying different filters 2', async () => {
        const query = `query {
            scans(activity_category:"workshop") {
                activity_name
                _count {
                    _all
                }
            }
        }`
        const expected = getAllActivitiesWithFilter(undefined, undefined, "workshop");
        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.scans).toEqual(expected))
    })
})

server.close()