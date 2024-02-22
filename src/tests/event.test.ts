import {describe, expect, test} from "@jest/globals"
import { server } from "../server"
import { executeQuery, EVENT_DATA } from "./util";

describe('all events endpoint', () => {
    test('test if endpoint returns all events correctly', async () => {
        const query = `query {
            allEvents {
                event
            }
        }`

        const expected = EVENT_DATA

        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.allEvents).toEqual(expected))
    })
})

server.close()