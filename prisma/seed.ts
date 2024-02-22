import { PrismaClient, Prisma } from '@prisma/client'
import { readFileSync } from "fs"
import { Skill } from "../src/lib/types"
import { getUniqueSkills } from "../src/lib/util"
import { randomBytes, createHash } from "crypto"

const prisma = new PrismaClient()

const ALL_USER_DATA = JSON.parse(readFileSync("./prisma/mockUserData.json", 'utf-8'));

const userData: Prisma.UserCreateInput[] = ALL_USER_DATA.map((user) => {
  const salt = randomBytes(20).toString('hex')
  const QRCodeHash = createHash('sha256')
    .update(user.name + user.email + user.phone + salt).digest('hex')
  
  // a single user doesn't seem to have too many skills
  //  so it should be fine doing this operation
  //  plus it's used in the seed operation, which will only run once 
  // need to do this because data is not unique, a user can have same skill and
  //  same rating
  // we throw away the any ocurrence beyond the first of the skill
  const uniqueSkills =  getUniqueSkills(user.skills)

  return {
    name: user.name,
    company: user.company,
    email: user.email,
    phone: user.phone,
    salt: salt,
    QRCodeHash: QRCodeHash,
    signedIn: false,
    signedInAt: null,
    skills: {
      create: uniqueSkills
    }
  }
})

async function main() {
  console.log(`Start seeding ...`)
  console.table(userData)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
