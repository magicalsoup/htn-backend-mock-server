import { builder } from '../builder'
import { prisma } from '../db'

// object ref definitions
builder.prismaObject('Event', {
    fields: (t) => ({
        event: t.exposeString('event'),
    })
})

// queries
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
