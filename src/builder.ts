import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import { prisma } from './db'


export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: {}
  Scalars: {}
  Objects: {
    SkillAggregate: {
      _all: number
    }
    SkillFrequency: {
      skill: string,
      _count: {
        _all: number
      }
    }
  }
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
})

builder.queryType({})
builder.mutationType({})
