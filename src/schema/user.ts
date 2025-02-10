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
    // salt: t.exposeString('salt'), // ok to expose, also needed for client side (or somewhere) to generate the QRcode
    // QRCodeHash: t.exposeString('QRCodeHash'), // ok to expose, since it's really just a unique identified for a user, does not contain sensitive information
    // signedIn: t.exposeBoolean('signedIn'),
    // signedInAt: t.expose('signedInAt', { type: 'DateTime', nullable: true }),
    scans: t.relation('scans'),
    updated_at: t.expose('updated_at', { type: 'DateTime' })
    // skills: t.relation('skills'),
    // events: t.relation('events')
  }),
})

// builder.objectType('SignInData', {
//   fields: (t) => ({
//     hour: t.exposeString('hour'),
//     numberOfUsers: t.exposeInt('numberOfUsers')
//   })
// })


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
      id: t.arg.int({ required: true }),
    },
    resolve: (query, parent, args) => 
      prisma.user.findFirst({
        ...query,
        where: { id: args.id }
      })
  }),
  // signInData: t.field({
  //   type: ['SignInData'],
  //   args: {
  //     startTime: t.arg({ type: 'DateTime', required: true }),
  //     endTime: t.arg({ type: 'DateTime', required: true }),
  //   },
  //   resolve: async (query, args) => {
  //     // have to use RAW sql because prisma doesn't support sqlite datetime functions
  //     // have to /1000 because sqlite stores in ms instead of s for unix timestamps
  //     // under the hood sqlite3 stores Datetime as unixtime stamps, so have to convert
  //     //   before using time format
  //     const rawSQL = Prisma.sql`SELECT hour, CAST(COUNT(hour) as REAL) as numberOfUsers from 
  //     (SELECT 
  //         strftime('%H', datetime(signedInAt/1000, 'unixepoch')) as hour FROM user
  //         WHERE signedIn and signedInAt >= ${args.startTime} and signedInAt <= ${args.endTime}
  //     ) GROUP BY hour
  //     `
  //     const data: MaybePromise<readonly MaybePromise<{ hour: string; numberOfUsers: number; }>[]>= await prisma.$queryRaw(rawSQL)
  //     // console.log(data)
  //     return data
  //   }
  // })
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
          badge_code: args.data?.badge_code?? undefined,
          email: args.data?.email?? undefined,
          phone: args.data?.phone?? undefined,
        },
        where: { id: args.id }
      })
    }
  }),
}))