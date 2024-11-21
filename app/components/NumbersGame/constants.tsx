import React from "react";

export const IceCream = ({ colors, scale = 1 }: { colors: string[], scale?: number }) => (
    <svg width={80 * scale} height={120 * scale} viewBox="0 0 120 180">
        <path d="M60 180 L20 80 L100 80 Z" fill="#FFA94D" />
        {colors.map((color, index) => (
            <ellipse
                key={index}
                cx="60"
                cy={80 - index * 40}
                rx="40"
                ry="20"
                fill={color}
            />
        ))}
        <circle cx="60" cy="10" r="8" fill="#FF0000" />
    </svg>
)

export const Cake = ({ colors, scale = 1 }: { colors: string[], scale?: number }) => (
    <svg width={80 * scale} height={120 * scale} viewBox="0 0 120 120">
        {/* Base */}
        <rect x="20" y="80" width="80" height="20" fill="#8B4513" />
        {/* Layers */}
        {colors.map((color, index) => (
            <rect
                key={index}
                x="20"
                y={60 - index * 20}
                width="80"
                height="20"
                fill={color}
            />
        ))}
        {/* Cherry */}
        <circle cx="60" cy="10" r="8" fill="#FF0000" />
        {/* Frosting */}
        <path d="M20 40 Q60 20 100 40" stroke="white" strokeWidth="4" fill="none" />
    </svg>
)

export const iceCreamColors = ['#87CEFA', '#FECA57', '#98FB98', '#FFB6C1']
export const cakeColors = ['#FF69B4', '#20B2AA', '#FF7F50', '#FFD700']
export const russianNumbers = [
    'Ноль мороженых', 'Одно мороженое', 'Два мороженых', 'Три мороженых', 'Четыре мороженых',
    'Ноль тортиков', 'Один тортик', 'Два тортика', 'Три тортика', 'Четыре тортика'
]

export const englishNumbers = [
    'Zero ice creams', 'One ice cream', 'Two ice creams', 'Three ice creams', 'Four ice creams',
    'Zero cakes', 'One cake', 'Two cakes', 'Three cakes', 'Four cakes'
]
