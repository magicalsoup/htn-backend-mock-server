import {describe, expect, test} from "@jest/globals"
import { server } from "../server"
import { executeQuery, ALL_USER_DATA } from "./util";

const FIRST_USER = ALL_USER_DATA[0]

async function resetFirstUser() {
    const query = `mutation {
        updateUser(
          id: 1
          data: {name: "Breanna Dillon", company: "Jackson Ltd", email: "lorettabrown@example.net", phone: "+1-924-116-7963", skills: [{skill: "Swift", rating: 4}, {skill: "OpenCV", rating: 1}]}
        ) {
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
    await executeQuery(query, 'POST').then(res => {
        expect(res.status).toEqual(200)
        return res.json()
    }).then(res => expect(res.data.updateUser).toEqual(FIRST_USER))
}

async function signOutUser(id: number) {
    const query = `query {
        user(id: ${id}) {
            QRCodeHash,
        }
    }` 
    const QRCodeHash = await executeQuery(query, 'POST')
        .then(res => res.json())
        .then(res => res.data.user.QRCodeHash)
    
    const signOutQuery = `mutation {
            signOutUser(QRCodeHash: "${QRCodeHash}") {
                signedIn
                signedInAt
            }
    }`

    const expected = {
        signedIn: false,
        signedInAt: null,
    }
    await executeQuery(signOutQuery, 'POST').then(res => {
        expect(res.status).toEqual(200)
        return res.json()
    }).then(res => expect(res.data.signOutUser).toEqual(expected))
}

async function testSignInUser(id: number, signInAt: string, expected: any) {
    const userQuery = `query {
        user(id: ${id}) {
            QRCodeHash,
        }
    }`

    const QRCodeHash = await executeQuery(userQuery, 'POST')
        .then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        })
        .then(res => res.data.user.QRCodeHash)
    
    const signInQuery = `mutation {
        signInUser(QRCodeHash: "${QRCodeHash}", signedInAt: "${signInAt}") {
            signedIn
            signedInAt
        }
    }`

    await executeQuery(signInQuery, 'POST').then(res => {
        expect(res.status).toEqual(200)
        return res.json()
    }).then(res => expect(res.data.signInUser).toEqual(expected))
}

describe('get user info endpoint', () => {
    test('tests if the user (id = 1) information returend by the api is correct', async () => {
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

        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.user).toEqual(FIRST_USER))    
    })
    test('test if api returns null if supplied with invalid id', async () => {
        const query = `query {
            user(id: 0) {
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

        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.user).toBeNull())   
    })
})

describe('get all users endpoint', () => {
     test('test if all user information endpoint is returning all the user information correctly', async () => {
        const query = `query {
            allUsers {
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

        const expectedUsers = ALL_USER_DATA

        await executeQuery(query, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.allUsers).toEqual(expectedUsers))
    })
})

describe('update user endpoint', () => {
    test(`tests if user (id = 1) fields (name, company, email, phone) can be updated correctly`, async () => {
        const updateQuery1 = `mutation {
            updateUser(id: 1, data: { name: "James", phone: "1 + 666-999-4200" }) {
                name
                company
                email
                phone
            }
        }`

        const expectedUser = {
            name: 'James',
            company: 'Jackson Ltd',
            email: 'lorettabrown@example.net',
            phone: '1 + 666-999-4200'
        }

        await executeQuery(updateQuery1, 'POST').then(res => res.json()).then(res => 
            expect(res.data.updateUser).toEqual(expectedUser))
        
        await resetFirstUser()
    })
    test('tests if updateUser returns original user (id = 1) if nothing is updated', async () => {
        const userQuery = `query {
            user(id: 1) {
                name,
                company,
                email,
                phone,
                skills {
                    skill
                    rating
                }
            }
        }` 
        const oldUser = await executeQuery(userQuery, 'POST').then(res => res.json())
        .then(res => res.data.user)

        const updateQuery = `mutation {
            updateUser(
                id: 1
                data: {}
            ) {
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

        await executeQuery(updateQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.updateUser).toEqual(oldUser))
    })
    test('tests if skill updates are correct (tested on user with id 1)', async () => {

        const updateQuery = `mutation {
            updateUser(
              id: 1
              data: {skills: [{skill: "Swift", rating: 7}, {skill: "yapping", rating: 10}, {skill: "new skill", rating: 0}]}
            ) {
              skills {
                skill
                rating
              }
            }
          }`

          const expectedSkills = {
            "skills": [{
                "skill": "Swift",
                "rating": 7
            },
            {
                "skill": "yapping",
                "rating": 10
            },
            {
                "skill": "new skill",
                "rating": 0
            }]
        }

        await executeQuery(updateQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.updateUser).toEqual(expectedSkills))

        await resetFirstUser()
    })
    test('test if we can lose all skills by passing [] as skill paramter for user (id=1)', async () => {
        const updateQuery = `mutation {
            updateUser(
              id: 1
              data: {skills: []}
            ) {
              skills {
                skill
                rating
              }
            }
          }`
        
        await executeQuery(updateQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.updateUser).toEqual({skills: []}))

        await resetFirstUser()
    })
})

describe('signInUser endpoint', () => {
    test('test if user (id=1) sign in is correct', async () => {

        const signInTime = new Date().toISOString()

        const expected = {
            signedIn: true,
            signedInAt: signInTime,
        }

        await testSignInUser(1, signInTime, expected)

        await signOutUser(1)
    })

    test('test if signIn will return null if no QRCode matches', async () => {
        const signedInAt = new Date().toISOString()

        const signInQuery = `mutation {
            signInUser(QRCodeHash: "aaabbbcccc", signedInAt: "${signedInAt}") {
                signedIn
                signedInAt
            }
        }`
    
        await executeQuery(signInQuery, 'POST').then(res => res.json()).then(res => expect(res.data).toBeNull())
    })

    test('test if signIn will do nothing if user is already signed in', async () => {
        const signedInAt = new Date().toISOString()
        const expected = {
            signedIn: true,
            signedInAt: signedInAt
        }
        await testSignInUser(11, signedInAt, expected)

        const signedInAtNew = "2025-11-20T23:15:01.306Z"

        await testSignInUser(11, signedInAtNew, expected)

        await signOutUser(11)

    })

    test('test if signInData with the first 10 users is correct', async () => {
        const signInTimes = [
            "2024-02-19T23:15:01.306Z", 
            "2024-02-19T23:16:01.306Z",
            "2024-02-19T20:44:01.306Z",
            "2024-02-19T22:42:01.306Z",
            "2024-02-19T21:31:01.306Z",
            "2024-02-19T20:28:01.306Z",
            "2024-02-19T20:17:01.306Z",
            "2024-02-19T20:50:01.306Z",
            "2024-02-19T20:09:01.306Z",
            "2024-02-19T19:27:01.306Z",
        ]
        const startTime = "2024-02-19T19:00:00.000Z"
        const endTime = "2024-02-19T23:59:59.000Z"
        for (let i = 0; i < 10; i++) {
            const expected = {
                signedIn: true,
                signedInAt: signInTimes[i]
            }
            await testSignInUser(i+1, signInTimes[i], expected)
        }

        const dataQuery = `query {
            signInData(startTime: "${startTime}", endTime: "${endTime}") {
                hour
                numberOfUsers
            }
        }`

        const expectedData = [
            {
                hour: "19",
                numberOfUsers: 1,
            },
            {
                hour: "20",
                numberOfUsers: 5,
            },
            {
                hour: "21",
                numberOfUsers: 1,
            },
            {
                hour: "22",
                numberOfUsers: 1,
            },
            {
                hour: "23",
                numberOfUsers: 2,
            }
        ]

        await executeQuery(dataQuery, 'POST').then(res => {
            expect(res.status).toEqual(200)
            return res.json()
        }).then(res => expect(res.data.signInData).toEqual(expectedData));

        for (let id = 1; id <= 10; id++) {
            await signOutUser(id)
        }

    })
})


server.close() // close the server once done testing