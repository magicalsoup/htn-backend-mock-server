# HTN Backend Server

This is a graphql server, written using prisma, pothos graphql, and typescript. See the contents below for navigation.

## Contents

- [Getting Started](#getting-started)
- [Using the GraphQL API](#using-the-graphql-api)
- [Enchancements](#Enchancements)

## Getting started

### 1. Clone the repo and install dependencies

Download this example:

```
git clone https://github.com/magicalsoup/htn-backend-challenge-2024.git
```

Install npm dependencies:

```
npm install
```

### 2. Create and seed the database

Run the following command to create the SQLite database file. This also creates the `User` and `Skill` tables that are defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

```
npx prisma migrate dev --name init
```

When `npx prisma migrate dev` is executed against a newly created database, seeding is also triggered. The seed file in [`prisma/seed.ts`](./prisma/seed.ts) will be executed and the database will be populated with the mock user data.


### 3. Start the GraphQL server

Launch the GraphQL server with this command:

```
npm run dev
```

Navigate to [http://localhost:4000](http://localhost:4000) in your browser to explore the API of your GraphQL server in a [GraphQL Playground](https://github.com/prisma/graphql-playground).


## Using the GraphQL API

The schema that specifies the API operations of the GraphQL server is defined in [`./schema.graphql`](./schema.graphql). Below are a number of operations that you can send to the API using the GraphQL Playground.

### Retrieve all users info (including their skills)

```graphql
query {
  allUsers {
    id
    name
    company
    email
    salt
    QRCodeHash
    phone
    skills {
      id
      skill
      rating
      userId
    }
  }
}
```

<details><summary><strong>See more API operations</strong></summary>

### Retrieve the information of a specific user

```graphql
query {
  user(id: FOO) {
    name
    company
    email
    salt
    QRCodeHash
    phone
    skills {
      id
      skill
      rating
      userId
    }
  }
}
```


### Updating a User

```graphql
mutation {
  updateUser(id: FOO, data: { name: "Sarah", phone: "+1 (555) 123 4567", skills: [{skill: "C++", rating: 5}] }) {
    id
    name
    company
    email
    phone
    skills {
      id
      skill
      rating
      userId
    }
  }
}
```

#### Note
- you are not able to update the user's salt or QRCode hash (on purpose, for obvious reasons)

#### Notes
- If you do not supply skills, then the server assumes no updates to skills.
- If you supply a non-null value to skills, then the server assumes those are the user's new cumulative skills. (e.g, if the user had skill A, B, C, but you supply the mutation query with skill D, the user will now only have skill D).
- You can make the user lose all their skills by supplying an empty array for skills.

### Getting the frequency of skills with filtering

```graphql
query {
  skillByFrequency(minFrequency: 5, maxFrequency: 10) {
    skill
    _count {
      _all
    }
  }
}
```
Note that the frequency of each skill is stored in `_all`. 
</details>

## Enchancements

### Sign in Users

You can sign in users using their QRCodeHash. You can query their QRCodeHash when getting a User information, or scanning the QRCode that correspondes to their QRCodeHash. The QRCode can be made from the salt and user info (see seed.ts) to see how their QRCode hashes are generated.

```graphql
mutation {
  signInUser(QRCodeHash: "2031b72d27f923adfb478f365de778f38c84091f83eb956925c261f9248c79b8") {
    id,
    name
    email
    signedIn
    signedInAt
    skills {
      id
      rating
      skill
    }
  }
}
```

#### Notes
- will return the user (with nothing changed) if the user is already signed in.
- will return an error if no user matches the QRCode hash

### User sign in data
gets how many users signed in between `startTime` and `endTime`, by the hour

```graphql
query {
  signInData(startTime: "2024-02-18T19:15:20.559Z", endTime: "2024-02-18T23:15:20.559Z") {
    hour
    numberOfUsers
  }
}
```

#### Notes
- both `startTime` and `endTime` must be specified in ISO 8601 date time format
