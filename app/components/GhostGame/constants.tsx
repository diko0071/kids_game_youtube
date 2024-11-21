import React from "react";

export const ghostColors = [
    { color: '#FFFFFF', name: 'Белый', englishName: 'White' },
    { color: '#FFC0CB', name: 'Розовый', englishName: 'Pink' },
    { color: '#FFFF00', name: 'Желтый', englishName: 'Yellow' },
    { color: '#0000FF', name: 'Синий', englishName: 'Blue' },
    { color: '#FF0000', name: 'Красный', englishName: 'Red' },
    { color: '#000000', name: 'Черный', englishName: 'Black' },
    { color: '#800080', name: 'Фиолетовый', englishName: 'Violet' },
    { color: '#008000', name: 'Зеленый', englishName: 'Green' },
    { color: '#FFA500', name: 'Оранжевый', englishName: 'Orange' },
    { color: '#808080', name: 'Серый', englishName: 'Gray' },
    { color: '#FFC0CB', name: 'Розовый', englishName: 'Pink' },
    { color: '#FFFF00', name: 'Желтый', englishName: 'Yellow' },
    { color: '#0000FF', name: 'Синий', englishName: 'Blue' },
    { color: '#FF0000', name: 'Красный', englishName: 'Red' }
]

export const Ghost = ({ color, scale = 1 }: { color: string, scale?: number }) => (
    <svg width={150 * scale} height={200 * scale} viewBox="0 0 150 200">
        <path d="M75 20 C40 20, 20 60, 20 100 C20 160, 50 180, 75 180 C100 180, 130 160, 130 100 C130 60, 110 20, 75 20 Z" fill={color} />
        <circle cx="55" cy="80" r="10" fill="#FFFFFF" />
        <circle cx="95" cy="80" r="10" fill="#FFFFFF" />
        <circle cx="55" cy="80" r="5" fill="#000000" />
        <circle cx="95" cy="80" r="5" fill="#000000" />
        <ellipse cx="75" cy="120" rx="20" ry="10" fill="#000000" />
    </svg>
)
