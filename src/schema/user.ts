import { DateTime } from 'graphql-scalars/typings/typeDefs'
import { builder } from '../builder'
import { prisma } from '../db'
import { GraphQLError, isNullableType } from 'graphql'
import { Prisma } from '@prisma/client'
import { MaybePromise } from '@pothos/core'

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name', { nullable: true }),
    company: t.exposeString('company'),
    email: t.exposeString('email'),
    phone: t.exposeString('phone'),
    salt: t.exposeString('salt'), // ok to expose, also needed for client side (or somewhere) to generate the QRcode
    QRCodeHash: t.exposeString('QRCodeHash'), // ok to expose, since it's really just a unique identified for a user, does not contain sensitive information
    signedIn: t.exposeBoolean('signedIn'),
    signedInAt: t.expose('signedInAt', { type: 'DateTime', nullable: true }),
    skills: t.relation('skills'),
  }),
})

builder.objectType('SignInData', {
  fields: (t) => ({
    hour: t.exposeString('hour'),
    numberOfUsers: t.exposeInt('numberOfUsers')
  })
})

const SkillCreateInput = builder.inputType('SkillCreateInput', {
  fields: (t) => ({
    skill: t.string({ required: true }),
    rating: t.int({ required: true }),
  })
})

const UserUpdateInput = builder.inputType('UserUpdateInput', {
  fields: (t) => ({
    name: t.string(),
    company: t.string(),
    email: t.string(),
    phone: t.string(),
    skills: t.field({ type: [SkillCreateInput] })   
  })
})


builder.queryFields((t) => ({
  allUsers: t.prismaField({
    type: ['User'],
    resolve: (query) => prisma.user.findMany({...query})
  }),
  user: t.prismaField({
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
  signInData: t.field({
    type: ['SignInData'],
    args: {
      startTime: t.arg({ type: 'DateTime', required: true }),
      endTime: t.arg({ type: 'DateTime', required: true }),
    },
    resolve: async (query, args) => {
      // have to use RAW sql because 
      // have to /1000 because sqlite stores in ms instead of s for unix timestamps
      // also need under the hood sqlite3 stores Datetime as unixtime stamps, so have to convert
      //   before using time format
      const rawSQL = Prisma.sql`SELECT hour, CAST(COUNT(hour) as REAL) as numberOfUsers from 
      (SELECT 
          strftime('%H', datetime(signedInAt/1000, 'unixepoch')) as hour FROM user
          WHERE signedIn and signedInAt >= ${args.startTime} and signedInAt <= ${args.endTime}
      ) GROUP BY hour
      `
      const data: MaybePromise<readonly MaybePromise<{ hour: string; numberOfUsers: number; }>[]>= await prisma.$queryRaw(rawSQL)
      // console.log(data)
      return data
    }
  })
}))

builder.mutationFields((t) => ({
  updateUser: t.prismaField({
    type: 'User',
    args: {
      id: t.arg.int({ required: true }),
      data: t.arg({ type: UserUpdateInput }),
    },
    resolve: async (query, parent, args) => {
      // data is not unique, turns out users can have same skill with same rating

      // could do upsert (not implemented)
      //  but then would require knowing skill id (since this is the only unique identifier)
      //  which is not ideal, also user would need to input whether skills are gained or lost 
      //  since alternative solution would be to query and check which would be inefficient


      // to allow for users to lose skills, if the user inputs a set of skills in the body (not null)
      //   then we assume those are the new skills for the user
      // otherwise we assume no changes for skills
      if (args.data?.skills) {
        await prisma.skill.deleteMany({
          where: { userId: args.id } 
        })

        args.data.skills.forEach(async (skill) => {
          await prisma.skill.create({
            data: {
              skill: skill.skill,
              rating: skill.rating,
              userId: args.id,
            }
          });
        })
      }
   
      return prisma.user.update({
        data: {
          name: args.data?.name?? undefined,
          company: args.data?.company?? undefined,
          email: args.data?.email?? undefined,
          phone: args.data?.phone?? undefined,
        },
        where: { id: args.id }
      })
    }
  }),
  signInUser: t.prismaField({
    type: 'User',
    args: {
      QRCodeHash: t.arg.string({ required: true }),
    },
    resolve: async (query, parent, args) => {
      const user = await prisma.user.findUnique({where: { QRCodeHash: args.QRCodeHash }})
      const currentDatetime = new Date().toISOString()

      if (!user) {
        return Promise.reject(
          new GraphQLError(`User with hash ${args.QRCodeHash} not found!`)
        )
      }

      // maybe should throw error here
      if (user.signedIn) {
        return user; // no need to update
      }

      return prisma.user.update({
        ...query,
        data: {
          signedIn: true,
          signedInAt: new Date(),
        },
        where: { QRCodeHash: args.QRCodeHash }
      });
    }
  })
}))