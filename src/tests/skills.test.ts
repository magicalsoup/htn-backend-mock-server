import {describe, expect, test} from "@jest/globals"
import { server } from "../server"
import { executeQuery, MODIFIED_ALL_USER_DATA } from "./util";

function getAllSkillsWithFrequencyBetween(minFrequency: number, maxFrequency: number) {
    let frequency = new Map<string, number>()
    for (const user of MODIFIED_ALL_USER_DATA) {
        for (const skill of user.skills) {
            frequency.set(skill.skill, (frequency.get(skill.skill)?? 0) + 1)
        }
    }
    let result: any[] = []
    frequency.forEach((freq, skill) => {
        if (freq >= minFrequency && freq <= maxFrequency) {
            result.push({
                skill: skill,
                _count: {
                    _all: freq
                }
            })
        }
    })
    result.sort((r1, r2) => {
        if (r1.skill < r2.skill) {
            return -1;
        } 
        if (r1.skill > r2.skill) {
            return 1;
        }
        return 0;
    })
    return result;
}

describe('get skill frequency endpoint', () => {
    test('test if the frequency count for the skills is correct', async () => {
        const query = `query {
            skillsByFrequency(minFrequency: 23, maxFrequency: 28) {
                skill
                _count {
                    _all
                }
            }
        }`
        const expected = getAllSkillsWithFrequencyBetween(23, 28)
        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.skillsByFrequency).toEqual(expected))
    })
})

server.close()