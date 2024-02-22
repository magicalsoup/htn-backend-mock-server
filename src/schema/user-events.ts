import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('UserEvents', {
    fields: (t) => ({
        event: t.exposeString('event'),
        user: t.relation('user')
    })
})

builder.mutationFields((t) => ({
    eventSignIn: t.prismaField({
        type: 'User',
        nullable: true,
        args: {
            userQRHash: t.arg.string({ required: true }),
            event: t.arg.string({ required: true })
        },
        resolve: async (query, parent, args) => {
            // need to first find user to see if user exists
            const user = await prisma.user.findUnique({
                where: { QRCodeHash: args.userQRHash }
            })
            
            // should rarely happen, but should still check
            if (!user) {
                return Promise.reject(
                    new GraphQLError(`User with hash ${args.userQRHash} not found!`)
                )
            }

            const event = await prisma.event.findUnique({
                where: { event: args.event }
            })
            
            // do validation on if event exists
            if (!event) {
                return Promise.reject(
                    new GraphQLError(`Event ${args.event} not found!`)
                )
            }

            // doesn't do anything if user has signed in before
            await prisma.userEvents.upsert({
                where: { 
                    event_userQRHash: {
                        userQRHash: args.userQRHash, 
                        event: args.event,
                    }
                },
                update: {},
                create: {
                   event: args.event,
                   userQRHash: args.userQRHash, 
                }
            })
            return prisma.user.findFirst({
                ...query,
                where: { QRCodeHash: args.userQRHash }
            })
        }
    }),
    // not really used for hackers, more for backend team for tests
    eventSignOut: t.prismaField({
        type: 'User',
        nullable: true,
        args: {
            userQRHash: t.arg.string({ required: true }),
            event: t.arg.string({ required: true })
        },
        resolve: async (query, parent, args) => {
            // need to first find user to see if user exists
            const user = await prisma.user.findUnique({
                where: { QRCodeHash: args.userQRHash }
            })
            
            // should rarely happen, but should still check
            if (!user) {
                return Promise.reject(
                    new GraphQLError(`User with hash ${args.userQRHash} not found!`)
                )
            }

            const event = await prisma.event.findUnique({
                where: { event: args.event }
            })
            
            // do validation on if event exists
            if (!event) {
                return Promise.reject(
                    new GraphQLError(`Event ${args.event} not found!`)
                )
            }

            // doesn't do anything if user has signed in before
            await prisma.userEvents.delete({
                where: { 
                    event_userQRHash: {
                        userQRHash: args.userQRHash, 
                        event: args.event,
                    }
                },
            })

            return prisma.user.findFirst({
                ...query,
                where: { QRCodeHash: args.userQRHash }
            })
        }
    })
}))

