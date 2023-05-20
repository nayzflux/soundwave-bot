import clsx from "clsx";
import React from "react";
import {onAddSong} from "@/utils/socket";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import {convertirTemps} from "@/utils/time";
import queueState from "@/atoms/queueAtom";
import queueAtom from "@/atoms/queueAtom";

interface SearchSongItemProps {
    name: string,
    authors: string,
    durationMs: number,
    coverUrl: string,
    url: string
    explicit: boolean,
}

const SearchSongItem: React.FC<SearchSongItemProps> = ({explicit, name, authors, coverUrl, url, durationMs}) => {
    const [guild, setGuild] = useRecoilState(guildState)
    const [queue, setQueue] = useRecoilState(queueState)

    const addToQueue = (song: Song) => {
        // @ts-ignore
        setQueue({isPlaying: queue.isPlaying, songs:[...queue.songs, song]});
    }

    const handleClick = (e: any) => {
        e.preventDefault();
        if (!guild) return;
        onAddSong(guild.id, url);
        addToQueue({name, authors, coverUrl, durationMs})
    }

    return (
        <div className="flex flex-row cursor-pointer space-x-3 items-center w-full hover:bg-gray-200 hover:bg-opacity-10 p-2 rounded-lg transition-all duration-500 ease-out active:scale-95" onClick={handleClick}>
            <img className="w-12 h-12" src={coverUrl} alt={`Cover de ${name}`}/>
            <div className="flex flex-col flex-grow">
                <p className="font-semibold text">{name}</p>
                <div className="flex flew-row space-x-1 text-sm">
                    <p className={`text-black bg-gray-300 px-1 rounded ${explicit ? "" : "hidden"}`}>E</p>
                    <p className="text-gray-300">{authors}</p>
                </div>
            </div>
            <p className="ml-auto text-gray-300 text-sm">{convertirTemps(durationMs)}</p>
        </div>
    );
}

export default SearchSongItem