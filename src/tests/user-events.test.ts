import {describe, expect, test} from "@jest/globals"
import { server } from "../server"
import { executeQuery } from "./util";

async function testEventSignOutFirstUser(QRCodeHash: string, event: string) {
    const query = `mutation {
        eventSignOut(userQRHash: "${QRCodeHash}", event: "${event}") {
            events {
                event
            }
        }
    }`

    await executeQuery(query, 'POST').then(res => {
        expect(res.status).toEqual(200)
        return res.json()
    })
}

describe('test user events endpoint', () => {
    test('test if endpoint adds user event correctly', async () => {
        const userQuery = `query {
            user(id: 1) {
                QRCodeHash
            }
        }`
        const QRCodeHash = await executeQuery(userQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => res.data.user.QRCodeHash)
    
        const eventQuery = `query {
            allEvents {
                event
            }
        }`
    
        const event = await executeQuery(eventQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => res.data.allEvents[0].event) // choose first event
        
        const signInQuery = `mutation {
            eventSignIn(userQRHash: "${QRCodeHash}", event: "${event}") {
                events {
                    event
                }
            }
        }`
    
        const expected = [{event: event}]
        await executeQuery(signInQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.eventSignIn.events).toEqual(expected))

        await testEventSignOutFirstUser(QRCodeHash, event)
    })
    test('test if endpoint rejects (returns null) if user does not exist', async () => {

        const QRCodeHash = "aaaabbbbccc" // ideally should be another randomly generated hash
                                         // but since the hashes are random, hash collision has the same
                                         //  probabilty as the probability of a hash matching this string
                                         // (so should be fine)

        const eventQuery = `query {
            allEvents {
                event
            }
        }`
    
        const event = await executeQuery(eventQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => res.data.allEvents[0].event) // choose first event

        const signInQuery = `mutation {
            eventSignIn(userQRHash: "${QRCodeHash}", event: "${event}") {
                events {
                    event
                }
            }
        }`
    
        await executeQuery(signInQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.eventSignIn).toBeNull())
    })

    test('test if endpoint rejects (returns null) if event does not exist', async () => {

        const userQuery = `query {
            user(id: 1) {
                QRCodeHash
            }
        }`
        const QRCodeHash = await executeQuery(userQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => res.data.user.QRCodeHash)
    
        const event = "some random event not in database" // ideally should be another randomly generated hash

        const signInQuery = `mutation {
            eventSignIn(userQRHash: "${QRCodeHash}", event: "${event}") {
                events {
                    event
                }
            }
        }`
    
        await executeQuery(signInQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.eventSignIn).toBeNull())
    })
})

server.close()