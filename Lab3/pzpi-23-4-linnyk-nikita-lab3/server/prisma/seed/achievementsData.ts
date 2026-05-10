export const ACHIEVEMENTS_DATA = [
    {
        code: 'FIRST_STEP',
        title: 'Перший крок',
        description: 'Виконайте свою першу вправу правильно.',
        category: 'General',
        iconUrl: 'https://img.icons8.com/color/96/first-place-ribbon.png',
        conditionType: 'exercises_completed',
        conditionValue: 1
    },
    {
        code: 'PRACTICE_MAKES_PERFECT',
        title: 'Повторення - мати навчання',
        description: 'Успішно виконайте 10 вправ.',
        category: 'Progress',
        iconUrl: 'https://img.icons8.com/color/96/dumbbell.png',
        conditionType: 'exercises_completed',
        conditionValue: 10
    },
    {
        code: 'LANGUAGE_GURU',
        title: 'Мовний Гуру',
        description: 'Успішно виконайте 100 вправ.',
        category: 'Progress',
        iconUrl: 'https://img.icons8.com/color/96/guru.png',
        conditionType: 'exercises_completed',
        conditionValue: 100
    },
    {
        code: 'POINT_COLLECTOR',
        title: 'Збирач балів',
        description: 'Наберіть 500 балів сумарно.',
        category: 'Score',
        iconUrl: 'https://img.icons8.com/color/96/coins.png',
        conditionType: 'points_earned',
        conditionValue: 500
    },
    {
        code: 'MILLIONAIRE',
        title: 'Мільйонер',
        description: 'Наберіть 1000 балів сумарно.',
        category: 'Score',
        iconUrl: 'https://img.icons8.com/color/96/money-bag.png',
        conditionType: 'points_earned',
        conditionValue: 1000
    },
    {
        code: 'CHATTY',
        title: 'Базіка',
        description: 'Надішліть перше повідомлення в чат.',
        category: 'Social',
        iconUrl: 'https://img.icons8.com/color/96/chat.png',
        conditionType: 'messages_sent',
        conditionValue: 1
    }
];