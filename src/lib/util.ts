import { Skill } from "./types"

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