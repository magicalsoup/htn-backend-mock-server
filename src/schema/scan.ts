import { MaybePromise } from '@pothos/core';
import { builder } from '../builder'
import { prisma } from '../db'
import { Prisma } from '@prisma/client';

builder.prismaObject('Scan', {
  fields: (t) => ({
    activity_name: t.exposeString('activity_name'),
    activity_category: t.exposeString('activity_category'),
    scanned_at: t.expose('scanned_at', {type: "DateTime"}),
    user: t.relation('user')
  }),
})

builder.mutationFields((t) => ({
  scanUser: t.prismaField({
    type: 'Scan',
    args: {
      uid: t.arg.int({ required: true }),
      activity_name: t.arg.string({ required: true }),
      activity_category: t.arg.string({ required: true})
    },
    resolve: async (query, parent, args) => {
      // update user updatedAt
      await prisma.user.update({
        data: {
          updated_at: new Date().toISOString(),
        },
        where: {id: args.uid}
      }); 

      // always a new event, since scanned_at is different
      return prisma.scan.create({
        data: {
          uid: args.uid,
          activity_category: args.activity_category,
          activity_name: args.activity_name,
          scanned_at: new Date().toISOString()
        }
      })
    }
  }),
}))

const ActivityAggregate = builder.objectType('ActivityAggregate', {
  fields: (t) => ({
      _all: t.exposeInt('_all')
  })
})

builder.objectType('ActivityFrequency', {
  fields: (t) => ({
      activity_name: t.exposeString('activity_name'),
      _count: t.expose('_count', {
          type: ActivityAggregate
      })
  })
})

builder.queryFields((t) => ({
  scans: t.field({
      type: ['ActivityFrequency'],
      args: {
          min_frequency: t.arg.int(),
          max_frequency: t.arg.int(),
          activity_category: t.arg.string() 
      },
      // can't use having, it doesn't support _count (or aggregates) yet
      //  see https://github.com/prisma/prisma/issues/6570
      // so we use a hacky solution with .filter
      // also reason why we have _count { _all } as the field for frequency
      //  instead of just frequency (because we don't have to do .map and
      //  the endpoint can be done in one query)
      resolve: async (query, args) => {
          return (await prisma.scan.groupBy({
              by: ['activity_name', 'activity_category'],
              _count: {
                  _all: true
              },
          })).filter((scan) => 
              (args.min_frequency? scan._count._all >= args.min_frequency : true) &&
              (args.max_frequency? scan._count._all <= args.max_frequency : true) &&
              args.activity_category? scan.activity_category === args.activity_category : true)
      }
  }),

}))