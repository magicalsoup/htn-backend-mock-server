import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import { prisma } from './db'
import { DateTimeResolver } from 'graphql-scalars'


export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: {}
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
  Objects: {
    ActivityAggregate: {
      _all: number
    }
    ActivityFrequency: {
      activity_name: string,
      activity_category: string,
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

builder.addScalarType('DateTime', DateTimeResolver, {})
