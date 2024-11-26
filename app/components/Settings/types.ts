export interface GameSettings {
    numbersGame: boolean;
    alphabetGame: boolean;
    ghostGame: boolean;
    wordMatchingGame: boolean;
    syllableMatchingGame: boolean;
}

export interface Settings {
    numExercises: number;
    games: GameSettings;
}

export const DEFAULT_SETTINGS: Settings = {
    numExercises: 3,
    games: {
        numbersGame: true,
        alphabetGame: true,
        ghostGame: true,
        wordMatchingGame: true,
        syllableMatchingGame: true
    }
} 