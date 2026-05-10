import {prisma} from "../lib/prisma.js";
import {
    CreateLanguageInput, UpdateLanguageInput
} from "../middlewares/validation/language.schema.js";


export const addLanguage = async (data: CreateLanguageInput) => {
    return prisma.language.create({data})
};

export const getLanguages = async () => {
    return prisma.language.findMany({
        select: {
            id: true,
            code: true,
            name: true
        }
    });
}

export const updateLanguage = async (data: {id: number} & UpdateLanguageInput) => {
    return prisma.language.update({
        where: {id: data.id},
        data
    });
}