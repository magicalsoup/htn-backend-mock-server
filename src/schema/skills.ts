import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('Skill', {
    fields: (t) => ({
        id: t.exposeInt('id'),
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

builder.queryFields((t) => ({
    skillsByFrequency: t.field({
        type: ['SkillFrequency'],
        args: {
            minFrequency: t.arg.int({ required: true }),
            maxFrequency: t.arg.int({ required: true }),
        },
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