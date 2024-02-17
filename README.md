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
git clone [todo]
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
    name,
    company,
    email,
    phone,
    skills {
      id,
      skill,
      rating,
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
    name,
    company,
    email,
    phone,
    skills: {
      id,
      skill,
      rating,
      userId
    }
  }
}
```


### Updating a User

```graphql
mutation {
  updateUser(id: FOO, data: { name: "Sarah", phone: "+1 (555) 123 4567", skills: [{skill: "C++", rating: 5}] }) {
    id,
    name,
    company,
    email,
    phone,
    skills: {
      id,
      skill,
      rating,
      userID
    }
  }
}
```

Note that if you do not supply skills, then the server assumes no updates to skills. If you do supply a not null value to skills, then the server assumes those are the user's new cumulative skills. (e.g, if the user had skill A, B, C, but you supply the mutation query with skill D, the user will now only have skill D). 

You can make the user lose all their skills by supplying an empty array for skills.

### Getting the frequency of skills with filtering

```graphql
query {
  skillByFrequency(minFrequency: 5, maxFrequency: 10) {
    skill,
    _count {
      _all
    }
  }
}
```
Note that the frequency of each skill is stored in `_all`. 

