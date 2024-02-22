// typescript types for users and skills

export type Skill = {
    skill: string;
    rating: number;
}

export type User = {
    name: string;
    company: string;
    email: string;
    phone: string;
    skills: Skill[];
}