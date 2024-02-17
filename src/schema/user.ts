import { builder } from '../builder'
import { prisma } from '../db'

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeInt('id'),
    name: t.exposeString('name', { nullable: true }),
    company: t.exposeString('company'),
    email: t.exposeString('email'),
    phone: t.exposeString('phone'),
    skills: t.relation('skills'),
  }),
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
  })
}))