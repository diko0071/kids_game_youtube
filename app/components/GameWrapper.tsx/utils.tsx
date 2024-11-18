import {PLAYLISTS} from "@/app/components/GameWrapper.tsx/constants";

export const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export const getRandomPlaylistId = () => {
    const randomIndex = Math.floor(Math.random() * PLAYLISTS.length);
    return PLAYLISTS[randomIndex].id;
};

export const handlePlaylistSelect = (playlistId: string) => {
    window.location.href = `?playlist=${playlistId}`;
};
