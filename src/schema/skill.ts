import { builder } from '../builder'
import { prisma } from '../db'

// object ref definitions
builder.prismaObject('Skill', {
    fields: (t) => ({
        skill: t.exposeString('skill'),
        rating: t.exposeInt('rating'),
        user: t.relation('user'),
    }),
})

const SkillAggregate = builder.objectType('SkillAggregate', {
    fields: (t) => ({
        _all: t.exposeInt('_all')
    })
})

builder.objectType('SkillFrequency', {
    fields: (t) => ({
        skill: t.exposeString('skill'),
        _count: t.expose('_count', {
            type: SkillAggregate
        })
    })
})

// queries
builder.queryFields((t) => ({
    skillsByFrequency: t.field({
        type: ['SkillFrequency'],
        args: {
            minFrequency: t.arg.int({ required: true }),
            maxFrequency: t.arg.int({ required: true }),
        },
        // can't use having, it doesn't support _count (or aggregates) yet
        //  see https://github.com/prisma/prisma/issues/6570
        // so we use a hacky solution with .filter
        // still works
        resolve: async (query, args) => {
            return (await prisma.skill.groupBy({
                by: 'skill',
                _count: {
                    _all: true
                },
            })).filter((skill) => 
                skill._count._all >= args.minFrequency &&
                skill._count._all <= args.maxFrequency)
        }
    })
}))
