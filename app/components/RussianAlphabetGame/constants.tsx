import React from "react";

export const russianLetters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П']
export const letterColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#FFB347', '#98FB98', '#DDA0DD', '#87CEEB', '#F08080',
    '#9370DB', '#20B2AA', '#FFD700', '#FF69B4', '#7B68EE'
]

export const RussianLetter = ({ letter, color, scale = 1 }: { letter: string; color: string; scale?: number }) => (
    <svg width={80 * scale} height={120 * scale} viewBox="0 0 120 120">
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
        { russian: 'Ананас', english: 'Pineapple' }
    ],
    'Б': [
        { russian: 'Банан', english: 'Banana' },
        { russian: 'Бабочка', english: 'Butterfly' },
        { russian: 'Белка', english: 'Squirrel' },
        { russian: 'Братик', english: 'Brother' }
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
        { russian: 'Даня', english: 'Daniel' }
    ],
    'Е': [
        { russian: 'Ель', english: 'Spruce' },
        { russian: 'Ежик', english: 'Hedgehog' },
        { russian: 'Енот', english: 'Raccoon' },
        { russian: 'Единорог', english: 'Unicorn' }
    ],
    'Ж': [
        { russian: 'Жираф', english: 'Giraffe' },
        { russian: 'Жук', english: 'Beetle' },
        { russian: 'Желе', english: 'Jelly' },
        { russian: 'Жемчуг', english: 'Pearl' }
    ],
    'З': [
        { russian: 'Заяц', english: 'Rabbit' },
        { russian: 'Зебра', english: 'Zebra' },
        { russian: 'Зонт', english: 'Umbrella' },
        { russian: 'Звезда', english: 'Star' }
    ],
    'И': [
        { russian: 'Игрушка', english: 'Toy' },
        { russian: 'Индюк', english: 'Turkey' },
        { russian: 'Ирис', english: 'Iris' },
        { russian: 'Игра', english: 'Game' }
    ],
    'К': [
        { russian: 'Кот', english: 'Cat' },
        { russian: 'Конфета', english: 'Candy' },
        { russian: 'Книга', english: 'Book' },
        { russian: 'Корова', english: 'Cow' }
    ],
    'Л': [
        { russian: 'Лиса', english: 'Fox' },
        { russian: 'Лимон', english: 'Lemon' },
        { russian: 'Лошадь', english: 'Horse' },
        { russian: 'Луна', english: 'Moon' }
    ],
    'М': [
        { russian: 'Мышка', english: 'Mouse' },
        { russian: 'Мяч', english: 'Ball' },
        { russian: 'Море', english: 'Sea' },
        { russian: 'Малина', english: 'Raspberry' }
    ],
    'Н': [
        { russian: 'Носорог', english: 'Rhino' },
        { russian: 'Небо', english: 'Sky' },
        { russian: 'Ножницы', english: 'Scissors' },
        { russian: 'Носок', english: 'Sock' }
    ],
    'О': [
        { russian: 'Обезьяна', english: 'Monkey' },
        { russian: 'Облако', english: 'Cloud' },
        { russian: 'Огурец', english: 'Cucumber' },
        { russian: 'Очки', english: 'Glasses' }
    ],
    'П': [
        { russian: 'Пингвин', english: 'Penguin' },
        { russian: 'Пирог', english: 'Pie' },
        { russian: 'Попугай', english: 'Parrot' },
        { russian: 'Панда', english: 'Panda' }
    ]
}
