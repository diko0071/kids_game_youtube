import { VIDEOS } from "@/app/components/GameWrapper.tsx/constants";

export const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export const getRandomVideoId = () => {
    const randomIndex = Math.floor(Math.random() * VIDEOS.length);
    return VIDEOS[randomIndex].id;
};

export const handleVideoSelect = (videoId: string) => {
    window.location.href = `?video=${videoId}`;
};
