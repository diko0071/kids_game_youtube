import React from "react";

export const russianLetters = ['А', 'Б', 'В', 'Г', 'Д']
export const letterColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

export const RussianLetter = ({ letter, color }: { letter: string; color: string }) => (
    <svg width="80" height="120" viewBox="0 0 120 120">
        <rect x="10" y="10" width="100" height="100" rx="10" ry="10" fill={color} />
        <text
            x="60"
            y="80"
            fontSize="80"
            fontWeight="bold"
            textAnchor="middle"
            fill="white"
        >
        {letter}
        </text>
    </svg>
)

export const russianWords = {
    'А': [
        { russian: 'Арбуз', english: 'Watermelon' },
        { russian: 'Апельсин', english: 'Orange' },
        { russian: 'Автобус', english: 'Bus' },
        { russian: 'Аист', english: 'Stork' }
    ],
    'Б': [
        { russian: 'Банан', english: 'Banana' },
        { russian: 'Бабочка', english: 'Butterfly' },
        { russian: 'Белка', english: 'Squirrel' },
        { russian: 'Берёза', english: 'Birch tree' }
    ],
    'В': [
        { russian: 'Ваза', english: 'Vase' },
        { russian: 'Волк', english: 'Wolf' },
        { russian: 'Вода', english: 'Water' },
        { russian: 'Велосипед', english: 'Bicycle' }
    ],
    'Г': [
        { russian: 'Гриб', english: 'Mushroom' },
        { russian: 'Груша', english: 'Pear' },
        { russian: 'Гитара', english: 'Guitar' },
        { russian: 'Голубь', english: 'Pigeon' }
    ],
    'Д': [
        { russian: 'Дом', english: 'House' },
        { russian: 'Дерево', english: 'Tree' },
        { russian: 'Дождь', english: 'Rain' },
        { russian: 'Дыня', english: 'Melon' }
    ]
}
