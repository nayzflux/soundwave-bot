import React from "react";

import {convertirTemps} from "@/utils/time";

interface SongItemProps extends Song{
    rank: number
}

const SongItem: React.FC<SongItemProps> = ({name, authors, durationMs, coverUrl, rank}) => {
    return (
        <div className="flex flex-row items-center space-x-3 hover:bg-gray-200 hover:bg-opacity-10 p-2 rounded-lg transition-all duration-500 ease-out active:scale-95">
            {/**<p className="hidden">{rank}</p>**/}
            <img className="w-12 h-12" src={coverUrl} alt={`Cover de ${name}`}/>

            <div className="flex flex-col overflow-hidden flex-grow">
                <p className="font-semibold truncate">{name}</p>
                <p className="text-gray-300 font-light truncate text-sm">{authors}</p>
            </div>

            <p className="text-sm text-gray-300">{convertirTemps(durationMs)}</p>
        </div>
    )
}

export default SongItem