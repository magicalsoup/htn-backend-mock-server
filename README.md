# HTN Backend Server

This is a graphql server, written using prisma, pothos graphql, and typescript. See the contents below for navigation.

## Contents

- [Getting Started](#getting-started)
- [Using the GraphQL API](#using-the-graphql-api)
- [Enchancements](#Enchancements)
- [Tests](#running-tests)

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

Run the following command to create the SQLite database file. This also creates the `User` and `Scan` tables that are defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

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

### Retrieve all users info 

```graphql
query {
  allUsers {
    id
    name
    badge_code
    email
    phone
    salt
    qr_code_hash
    scans {
      activity_name
      activity_category
      scanned_at
    }
    updated_at
  }
}
```


### Retrieve the information of a specific user

```graphql
query {
  user(id?: Int, email?: string, qr_code_hash?: string) {
    id
    name
    badge_code
    email
    phone
    salt
    qr_code_hash
    scans {
      activity_name
      activity_category
      scanned_at
    }
    updated_at
  }
}
```

## Note
- you can supply either the id, email, or qr_code_hash to get the user
- if you supply none of them, you will get thrown an error (rejected promise)


### Updating a User

```graphql
mutation {
  updateUser(id: Int, data: { name: "Sarah", phone: "+1 (555) 123 4567", email: "abc@example.com", badge_code: "apple-tree-water-earth"}) {
    id
    name
    badge_code
    email
    phone
    updated_at
  }
}
```
#### Notes
- You are not able to update the user's salt or QRCode hash (on purpose, for obvious reasons)

### Getting the frequency of activities with filtering

```graphql
query {
  scans(min_frequency?: Int, max_frequency?: Int activity_category?: String) {
    activity_name
    _count {
      _all
    }
  }
}
```
#### Notes
- the frequency of each activity is stored in `_all`.
- all parameters are optional 


## Enchancements

### Sign in Users

You can sign in users using their qr_code_hash. You can query their qr_code_hash when getting a user information. The QRCode is made from the salt and user info (see seed.ts to see how their QRCode hashes are generated).

```graphql
mutation {
  signInUser(qr_code_hash: "2031b72d27f923adfb478f365de778f38c84091f83eb956925c261f9248c79b8", signed_in_at: "2024-02-19T23:15:01.306Z") {
    id
    name
    badge_code
    email
    phone
    salt
    qr_code_hash
    scans {
      activity_name
      activity_category
      scanned_at
    }
    updated_at
  }
}
```

#### Notes
- will return the user (with nothing changed) if the user is already signed in.
- will return an error message and data will be null if no user matches the QRCode hash
- `signed_in_at` must be in 8601 ISO date time format
- we supply the signed_in_at - to reflect the time the user was actually signed in (in case server is slow)

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
- both `startTime` and `endTime` must be in ISO 8601 date time format


## Running Tests

You can run the tests by simply typing 

```
npm test
```

in the CLI. Note that you must have already seeded the database before running this command.
