import { readFileSync } from "fs";
import { Skill } from "./types"

export const EVENT_DATA = JSON.parse(readFileSync("./prisma/mockEventData.json", 'utf-8'))
export const ALL_USER_DATA = JSON.parse(readFileSync("./prisma/mockUserData.json", 'utf-8'))

export function getUniqueSkills(skills: Skill[]) {
    const uniqueSkills = skills.reduce((arr: Skill[] , skill: Skill) => {
        let hasSkill = false;
    
        for(const prevskill of arr) {
          if (prevskill.skill == skill.skill) {
            hasSkill = true;
            break;
          }
        }
    
        if (!hasSkill) {
          arr.push(skill)
        }
        return arr;
    }, [])
    return uniqueSkills;
}