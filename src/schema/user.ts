import { builder } from '../builder'
import { prisma } from '../db'
import { GraphQLError } from 'graphql'
import { Prisma } from '@prisma/client'
import { MaybePromise } from '@pothos/core'

// object ref definitions
builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name', { nullable: true }),
    badge_code: t.exposeString('badge_code'),
    email: t.exposeString('email'),
    phone: t.exposeString('phone'),
    salt: t.exposeString('salt'), // ok to expose, also needed for client side (or somewhere) to generate the QRcode
    qr_code_hash: t.exposeString('qr_code_hash'), // ok to expose, since it's really just a unique identified for a user, does not contain sensitive information
    signed_in: t.exposeBoolean('signed_in'),
    signed_in_at: t.expose('signed_in_at', { type: 'DateTime', nullable: true }),
    scans: t.relation('scans'),
    updated_at: t.expose('updated_at', { type: 'DateTime' })
  }),
})

builder.objectType('SignInData', {
  fields: (t) => ({
    hour: t.exposeString('hour'),
    num_of_users: t.exposeInt('num_of_users')
  })
})


const UserUpdateInput = builder.inputType('UserUpdateInput', {
  fields: (t) => ({
    name: t.string(),
    email: t.string(),
    phone: t.string(),
    badge_code: t.string(), 
  })
})

// queries
builder.queryFields((t) => ({
  allUsers: t.prismaField({ // information for all users
    type: ['User'],
    resolve: (query) => prisma.user.findMany({...query})
  }),
  user: t.prismaField({ // information for single user
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.int(),
      email: t.arg.string(),
      qr_code_hash: t.arg.string()
    },
    resolve: (query, parent, args) => { 
      if (args.id || args.email || args.qr_code_hash) {
        return prisma.user.findFirst({
          ...query,
          where: { 
            id: args.id ?? undefined, 
            email: args.email ?? undefined, 
            qr_code_hash: args.qr_code_hash ?? undefined
          }
        })
      } else if (args.email) {

      }
      return Promise.reject(
        new GraphQLError(`did not supply either id, email or qr_code_hash! Must supply some sort of unique identifier!`)
      )
    }
  }),
  signInData: t.field({
    type: ['SignInData'],
    args: {
      start_time: t.arg({ type: 'DateTime', required: true }),
      end_time: t.arg({ type: 'DateTime', required: true }),
    },
    resolve: async (query, args) => {
      // have to use RAW sql because prisma doesn't support sqlite datetime functions
      // have to /1000 because sqlite stores in ms instead of s for unix timestamps
      // under the hood sqlite3 stores Datetime as unixtime stamps, so have to convert
      //   before using time format
      const rawSQL = Prisma.sql`SELECT hour, CAST(COUNT(hour) as REAL) as num_of_users from 
      (SELECT 
          strftime('%H', datetime(signed_in_at/1000, 'unixepoch')) as hour FROM user
          WHERE signed_in and signed_in_at >= ${args.start_time} and signed_in_at <= ${args.end_time}
      ) GROUP BY hour
      `
      const data: MaybePromise<readonly MaybePromise<{ hour: string; num_of_users: number; }>[]>= await prisma.$queryRaw(rawSQL)
      // console.log(data)
      return data
    }
  })
}))


// mutations
builder.mutationFields((t) => ({
  updateUser: t.prismaField({
    type: 'User',
    args: {
      id: t.arg.int({ required: true }),
      data: t.arg({ type: UserUpdateInput }),
    },
    resolve: async (query, parent, args) => {
      return prisma.user.update({
        data: {
          name: args.data?.name?? undefined,
          email: args.data?.email?? undefined,
          phone: args.data?.phone?? undefined,
          badge_code: args.data?.badge_code?? undefined,
        },
        where: { id: args.id }
      })
    }
  }),
  signInUser: t.prismaField({
    type: 'User',
    args: {
      qr_code_hash: t.arg.string({ required: true }),
      signed_in_at: t.arg({ type: 'DateTime', required: true })
    },
    resolve: async (query, parent, args) => {
      const user = await prisma.user.findUnique({ where: { qr_code_hash: args.qr_code_hash } })

      if (!user) {
        return Promise.reject(
          new GraphQLError(`User with hash ${args.qr_code_hash} not found!`)
        )
      }

      // frontend can check if user is already signed in, so will not throw error here
      if (user.signed_in) {
        return user; // no need to update
      }

      return prisma.user.update({
        ...query,
        data: {
          signed_in: true,
          signed_in_at: args.signed_in_at
        },
        where: { qr_code_hash: args.qr_code_hash }
      });
    }
  }),

  // this endpoint is not intended for hackers, just for backend team for tests (see test file)
  signOutUser: t.prismaField({
    type: 'User',
    args: {
      qr_code_hash: t.arg.string({ required: true }),
    },
    resolve: async (query, parent, args) => {
      return prisma.user.update({
        ...query,
        data: {
          signed_in: false,
          signed_in_at: null,
        },
        where : { qr_code_hash: args.qr_code_hash }
      })
    }
  }),
}))