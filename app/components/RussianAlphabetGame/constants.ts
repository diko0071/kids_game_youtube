export const russianLetters = [
    'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И',
    'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т',
    'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'
]

export const letterColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71',
    '#F1C40F', '#1ABC9C', '#D35400', '#C0392B', '#8E44AD',
    '#2980B9', '#27AE60', '#F39C12', '#E67E22', '#16A085',
    '#95A5A6', '#34495E', '#7F8C8D', '#BDC3C7', '#E74C3C',
    '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C'
]

interface Word {
    russian: string;
    english: string;
}

export const russianWords: Word[] = [
    { russian: 'Арбуз', english: 'Watermelon' },
    { russian: 'Бабочка', english: 'Butterfly' },
    { russian: 'Волк', english: 'Wolf' },
    { russian: 'Груша', english: 'Pear' },
    { russian: 'Дом', english: 'House' },
    { russian: 'Ель', english: 'Spruce' },
    { russian: 'Ёжик', english: 'Hedgehog' },
    { russian: 'Жираф', english: 'Giraffe' },
    { russian: 'Зебра', english: 'Zebra' },
    { russian: 'Игрушка', english: 'Toy' },
    { russian: 'Йогурт', english: 'Yogurt' },
    { russian: 'Кот', english: 'Cat' },
    { russian: 'Лев', english: 'Lion' },
    { russian: 'Мама', english: 'Mom' },
    { russian: 'Нос', english: 'Nose' },
    { russian: 'Облако', english: 'Cloud' },
    { russian: 'Папа', english: 'Dad' },
    { russian: 'Рыба', english: 'Fish' },
    { russian: 'Солнце', english: 'Sun' },
    { russian: 'Тигр', english: 'Tiger' },
    { russian: 'Утка', english: 'Duck' },
    { russian: 'Фрукт', english: 'Fruit' },
    { russian: 'Хлеб', english: 'Bread' },
    { russian: 'Цветок', english: 'Flower' },
    { russian: 'Чашка', english: 'Cup' },
    { russian: 'Шар', english: 'Balloon' },
    { russian: 'Щенок', english: 'Puppy' },
    { russian: 'Эхо', english: 'Echo' },
    { russian: 'Юбка', english: 'Skirt' },
    { russian: 'Яблоко', english: 'Apple' }
]

export const RussianLetter: React.FC<{ letter: string; color: string; scale?: number }> = ({ 
    letter, 
    color, 
    scale = 1 
}) => {
    return (
        <div 
            style={{ 
                backgroundColor: color,
                width: `${100 * scale}px`,
                height: `${100 * scale}px`,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: `${48 * scale}px`,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}
            className="hover:transform hover:scale-110"
        >
            {letter}
        </div>
    )
} 