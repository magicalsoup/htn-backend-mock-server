import {describe, expect, test} from "@jest/globals"
import { yoga } from "../server"
import { server } from "../server"

describe('get user info', () => {
    test('get the user information with id 1', async () => {
        const query = `query {
                user(id: 1) {
                    name
                    company
                    email
                    phone
                    skills {
                        skill
                        rating
                    } 
                }
            }`
        const result = await yoga.fetch('http://127.0.0.1:4000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                query: query,
            })
        })
        
        expect(result).toBeDefined()
        const resultJSON = await result.json()
        const data = resultJSON.data
        expect(data).toBeDefined()
        const user = data.user
        expect(user).toBeDefined()
        expect(user.name).toEqual("Breanna Dillon")
        expect(user.company).toEqual("Jackson Ltd")
        expect(user.email).toEqual("lorettabrown@example.net")
        expect(user.phone).toEqual("+1-924-116-7963")

        const expectedSkills = [
            {
                "skill": "Swift",
                "rating": 4
            },
            {
                "skill": "OpenCV",
                "rating": 1
            }
        ]
        expect(user.skills).toEqual(expectedSkills)
        return
    })
})

describe('get all users', () => {
    
})

server.close() // close the server once done testing