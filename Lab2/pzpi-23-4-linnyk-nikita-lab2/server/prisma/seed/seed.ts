import {PERMISSIONS_DATA} from "./permissionsData";
import {ROLE_PERMISSIONS} from "../../src/constants/roles";
import {prisma} from "../../src/lib/prisma";
import {
    CourseLevel,
    ExerciseType,
    UserRole
} from "../../generated/prisma/enums";
import {hashPassword} from "../../src/utils/password";
import {ACHIEVEMENTS_DATA} from "./achievementsData";

async function seedRoles() {
    await prisma.permission.createMany({
        data: PERMISSIONS_DATA,
        skipDuplicates: true
    })

    const dbPermissions = await prisma.permission.findMany();
    const permissionMap = new Map(dbPermissions.map(p => [p.code, p.id]));

    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
        for (const permission of permissions) {
            await prisma.rolePermission.upsert({
                where: {
                    role_permissionId: {
                        role: role as UserRole,
                        permissionId: permissionMap.get(permission)
                    }
                },
                update: {},
                create: {
                    role: role as UserRole,
                    permissionId: permissionMap.get(permission)
                }
            })
        }
    }
}

async function seedAdmin() {
    await prisma.user.upsert({
        where: {email: "admin@langbang.com"},
        update: {},
        create: {
            username: "admin",
            email: "admin@langbang.com",
            passwordHash: await hashPassword('admin123'),
            role: "admin"
        }
    })
}

async function seedCoursesAndLessonsAndExercises() {
    const english = await prisma.language.upsert({
        where: { code: 'en' },
        update: {},
        create: {
            code: 'en',
            name: 'English',
        },
    })

    console.log(`Language created: ${english.name}`)

    const courseA1 = await prisma.course.create({
        data: {
            title: 'English for Beginners',
            description: 'Базовий курс для вивчення основ англійської мови.',
            level: CourseLevel.A1,
            targetLanguageId: english.id,

            lessons: {
                create: [
                    // --- УРОК 1: Greetings ---
                    {
                        title: 'Greetings & Introductions',
                        description: 'Learn basic greetings and introductions in English.',
                        sequence: 1,
                        exercises: {
                            create: [
                                {
                                    sequence: 1,
                                    type: ExerciseType.translation,
                                    question: 'Translate into Ukrainian: "Hello"',
                                    correctAnswer: 'Привіт',
                                    points: 10,
                                    metadata: { hint: 'Найпоширеніше привітання' }
                                },
                                {
                                    sequence: 2,
                                    type: ExerciseType.translation,
                                    question: 'Translate into Ukrainian: "Laptop"',
                                    correctAnswer: 'Ноутбук',
                                    points: 10,
                                    metadata: { }
                                },
                                {
                                    sequence: 3,
                                    type: ExerciseType.translation,
                                    question: 'Translate into Ukrainian: "Mouse"',
                                    correctAnswer: 'Миша',
                                    points: 15,
                                    metadata: {}
                                },
                                {
                                    sequence: 4,
                                    type: ExerciseType.translation,
                                    question: 'Translate into Ukrainian: "Comb"',
                                    correctAnswer: 'Гребінець',
                                    points: 15,
                                    metadata: {}
                                }
                            ]
                        }
                    },
                    // --- УРОК 2: Numbers ---
                    {
                        title: 'Numbers 1-10',
                        description: 'Learn how to count',
                        sequence: 2,
                        exercises: {
                            create: [
                                {
                                    sequence: 1,
                                    type: ExerciseType.translation,
                                    question: 'Write in English: "Один"',
                                    correctAnswer: 'One',
                                    points: 10
                                },
                                {
                                    sequence: 2,
                                    type: ExerciseType.writing,
                                    question: 'Fill gaps: One, Two, Three, ____, Five',
                                    correctAnswer: 'Four',
                                    points: 20
                                },
                                {
                                    sequence: 3,
                                    type: ExerciseType.translation,
                                    question: 'Write in English: "Дванадцять"',
                                    correctAnswer: 'Twelve',
                                    points: 10
                                },
                            ]
                        }
                    }
                ]
            }
        }
    })
    console.log(`Course created with ID: ${courseA1.courseId}`)
}

async function seedAchievements() {
    await prisma.achievement.createMany({
        data: ACHIEVEMENTS_DATA,
        skipDuplicates: true
    })
}

async function seedEnglishA2andB1() {
    const english = await prisma.language.upsert({
        where: { code: 'en' },
        update: {},
        create: { code: 'en', name: 'English' },
    });

    // ── A2 ──────────────────────────────────────────────────────────────────
    const existingA2 = await prisma.course.findFirst({
        where: { title: 'English for Elementary', level: CourseLevel.A2 },
    });
    if (!existingA2) {
        await prisma.course.create({
            data: {
                title: 'English for Elementary',
                description: 'Expand your everyday English for shopping, travel, routines, and food.',
                level: CourseLevel.A2,
                targetLanguageId: english.id,
                lessons: {
                    create: [
                        {
                            title: 'Shopping & Prices',
                            description: 'Learn vocabulary and phrases for shopping.',
                            sequence: 1,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "How much does it cost?"', correctAnswer: 'Скільки це коштує?', points: 10, metadata: { hint: 'Use "скільки" for "how much"' } },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "expensive"', correctAnswer: 'дорогий', points: 10, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "I\'d like to ___ this shirt."', correctAnswer: 'buy', points: 15, metadata: { hint: 'Purchase / acquire' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Знижка"', correctAnswer: 'Discount', points: 10, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "Can I pay by ___?"', correctAnswer: 'card', points: 15, metadata: { hint: 'Credit or debit ___' } },
                                ],
                            },
                        },
                        {
                            title: 'Travel & Directions',
                            description: 'Navigate cities and ask for directions.',
                            sequence: 2,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "Turn left at the traffic lights."', correctAnswer: 'Поверніть ліворуч на світлофорі.', points: 15, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "straight ahead"', correctAnswer: 'прямо', points: 10, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "The train ___ is five minutes away."', correctAnswer: 'station', points: 15, metadata: { hint: 'A place where trains stop' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Аеропорт"', correctAnswer: 'Airport', points: 10, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "Go ___ for two blocks, then turn right."', correctAnswer: 'straight', points: 15, metadata: {} },
                                ],
                            },
                        },
                        {
                            title: 'Daily Routines',
                            description: 'Describe your everyday schedule.',
                            sequence: 3,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "I wake up at seven o\'clock."', correctAnswer: 'Я прокидаюсь о сьомій годині.', points: 15, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "breakfast"', correctAnswer: 'сніданок', points: 10, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "She ___ to work by bus every day."', correctAnswer: 'goes', points: 15, metadata: { hint: 'Third person singular of "go"' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Чистити зуби"', correctAnswer: 'Brush teeth', points: 10, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "After dinner, I always ___ the dishes."', correctAnswer: 'wash', points: 15, metadata: {} },
                                ],
                            },
                        },
                        {
                            title: 'Food & Restaurants',
                            description: 'Order food and talk about meals.',
                            sequence: 4,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "Could I have the menu, please?"', correctAnswer: 'Можна мені меню, будь ласка?', points: 15, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "vegetarian"', correctAnswer: 'вегетаріанський', points: 10, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "I\'m ___. What do you recommend?"', correctAnswer: 'hungry', points: 15, metadata: { hint: 'Feeling a need to eat' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Рахунок"', correctAnswer: 'Bill', points: 10, metadata: { hint: 'Also accepted: Check' } },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "The soup of the ___ is tomato today."', correctAnswer: 'day', points: 15, metadata: {} },
                                ],
                            },
                        },
                    ],
                },
            },
        });
        console.log('Course created: English for Elementary (A2)');
    } else {
        console.log('Course already exists: English for Elementary (A2) — skipped');
    }

    // ── B1 ──────────────────────────────────────────────────────────────────
    const existingB1 = await prisma.course.findFirst({
        where: { title: 'English in Context', level: CourseLevel.B1 },
    });
    if (!existingB1) {
        await prisma.course.create({
            data: {
                title: 'English in Context',
                description: 'Use English confidently for work, health, technology, and the environment.',
                level: CourseLevel.B1,
                targetLanguageId: english.id,
                lessons: {
                    create: [
                        {
                            title: 'Work & Career',
                            description: 'Talk about jobs, responsibilities, and professional life.',
                            sequence: 1,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "I applied for a job last week."', correctAnswer: 'Я подав заявку на роботу минулого тижня.', points: 20, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "colleague"', correctAnswer: 'колега', points: 15, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "He received a pay ___ after three years."', correctAnswer: 'rise', points: 20, metadata: { hint: 'Salary increase' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Співбесіда"', correctAnswer: 'Job interview', points: 15, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "Working from ___ has become very popular."', correctAnswer: 'home', points: 20, metadata: {} },
                                ],
                            },
                        },
                        {
                            title: 'Health & Lifestyle',
                            description: 'Discuss health, medical visits, and healthy habits.',
                            sequence: 2,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "You should see a doctor immediately."', correctAnswer: 'Вам слід негайно звернутися до лікаря.', points: 20, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "prescription"', correctAnswer: 'рецепт', points: 15, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "Regular ___ helps maintain a healthy body."', correctAnswer: 'exercise', points: 20, metadata: { hint: 'Physical activity' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Симптоми"', correctAnswer: 'Symptoms', points: 15, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "A balanced ___ is important for good health."', correctAnswer: 'diet', points: 20, metadata: {} },
                                ],
                            },
                        },
                        {
                            title: 'Technology & Society',
                            description: 'Discuss modern technology and its impact on society.',
                            sequence: 3,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "This app uses artificial intelligence."', correctAnswer: 'Цей додаток використовує штучний інтелект.', points: 20, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "software update"', correctAnswer: 'оновлення програмного забезпечення', points: 15, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "Please ___ your password regularly for security."', correctAnswer: 'change', points: 20, metadata: { hint: 'Update / modify' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Хмарне сховище"', correctAnswer: 'Cloud storage', points: 15, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "Social ___ has changed how people communicate."', correctAnswer: 'media', points: 20, metadata: {} },
                                ],
                            },
                        },
                        {
                            title: 'Environment & Nature',
                            description: 'Discuss environmental issues and sustainability.',
                            sequence: 4,
                            exercises: {
                                create: [
                                    { sequence: 1, type: ExerciseType.translation, question: 'Translate into Ukrainian: "Climate change is a global problem."', correctAnswer: 'Зміна клімату — це глобальна проблема.', points: 20, metadata: {} },
                                    { sequence: 2, type: ExerciseType.translation, question: 'Translate into Ukrainian: "renewable energy"', correctAnswer: 'відновлювана енергія', points: 15, metadata: {} },
                                    { sequence: 3, type: ExerciseType.writing,     question: 'Fill in the gap: "We should ___ paper and plastic to protect the environment."', correctAnswer: 'recycle', points: 20, metadata: { hint: 'Process waste into reusable material' } },
                                    { sequence: 4, type: ExerciseType.translation, question: 'Write in English: "Забруднення"', correctAnswer: 'Pollution', points: 15, metadata: {} },
                                    { sequence: 5, type: ExerciseType.writing,     question: 'Fill in the gap: "Electric cars produce fewer ___ than petrol cars."', correctAnswer: 'emissions', points: 20, metadata: {} },
                                ],
                            },
                        },
                    ],
                },
            },
        });
        console.log('Course created: English in Context (B1)');
    } else {
        console.log('Course already exists: English in Context (B1) — skipped');
    }
}

async function main() {
    await seedRoles();
    await seedAdmin();
    await seedAchievements();
    await seedCoursesAndLessonsAndExercises();
    await seedEnglishA2andB1();
}

main()
    .then(async () => {
        console.log('Seeding done.');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })

