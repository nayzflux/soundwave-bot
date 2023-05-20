import React, {useEffect, useState} from "react";
import {PlayCircleIcon} from "@heroicons/react/24/solid";
import {onAddPlaylist} from "@/utils/socket";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import queueState from "@/atoms/queueAtom";

interface SpotifyPlaylistItemProps {
    id: string
    name: string;
    description: string;
    imageUrl: string;
    url: string,
    owner: string
}

const SpotifyPlaylistItem: React.FC<SpotifyPlaylistItemProps> = ({id, name, description, imageUrl, url, owner}) => {
    const [isShown, setIsShown] = useState(false);
    const [guild, setGuild] = useRecoilState(guildState);
    const [queue, setQueue] = useRecoilState(queueState);

    const addToQueue = (song: Song) => {
        // @ts-ignore
        setQueue({isPlaying: queue.isPlaying, songs:[...queue.songs, song]});
    }

    const handleClick = (e: any) => {
        e.preventDefault();
        if (guild) {
            onAddPlaylist(guild.id, url);
            addToQueue({coverUrl: imageUrl, durationMs: 0, name: name, authors: owner})
        }
    }

    return (
        <div className="cursor-pointer relative flex flex-col w-44 h-56 p-4 rounded-lg hover:bg-gray-200 hover:bg-opacity-10 transition-all duration-700 ease-out active:scale-95 space-y-1" onClick={handleClick} onMouseEnter={() => setIsShown(true)} onMouseLeave={() => setIsShown(false)}>
            <img className="w-40 h-40" src={imageUrl} alt={`Image de playlist`}/>
            <div className="flex flex-col">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-sm text-gray-300">{description}</p>
            </div>
            <button className="absolute w-14 h-14 rounded-full text-gray-200 hover:text-gray-100 top-1/2 right-5 drop-shadow-xl" hidden={!isShown}>
                <PlayCircleIcon/>
            </button>
        </div>
    )
}
export default SpotifyPlaylistItem;