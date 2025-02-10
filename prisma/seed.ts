import { PrismaClient, Prisma } from '@prisma/client'
import { ALL_USER_DATA } from '../src/lib/util'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = ALL_USER_DATA.map((user) => {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    badge_code: user.badge_code,
    updated_at: new Date().toISOString(),
    scans: {
       // need to do this because a lot of dates are not formatted correctly in iso8601 format
      create: user.scans.map((scan) => {
        return {
          activity_name: scan.activity_name,
          activity_category: scan.activity_category,
          scanned_at: new Date(scan.scanned_at).toISOString()
        }
      })
    }
  }
})

async function main() {
  console.log(`Start seeding ...`)
  console.table(userData)
  let failed_creates = 0;
  for (const u of userData) {
   
    // also, some badge_codes are not unique, so we are just going to assume data is bad and skip them (but we log them )
    try {
      const user = await prisma.user.create({
        data: u,
      })
      console.log(`Created user with id: ${user.id}`)
    } catch (error) {
      failed_creates++;
      console.warn(`could not create user. Error: ${error}`)
      console.warn(u);
    }
  }

  console.log(`Seeding finished. ${failed_creates} users failed to create`)
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
