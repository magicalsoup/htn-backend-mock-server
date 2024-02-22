import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('Event', {
    fields: (t) => ({
        event: t.exposeString('event'),
    })
})

builder.queryFields((t) => ({
    allEvents: t.prismaField({
        type: ['Event'],
        resolve: (query) => {
            return prisma.event.findMany({
                ...query
            })
        }
    })
}))
