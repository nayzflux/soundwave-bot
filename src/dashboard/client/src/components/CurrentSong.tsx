"use client";

import Image from "next/image";
import React from "react";
import {useRecoilState} from "recoil";
import queueState from "@/atoms/queueAtom";

interface CurrentSongProps {
    coverUrl: string;
    title: string;
    authors: string;
}

const CurrentSong: React.FC<CurrentSongProps> = ({coverUrl, title, authors}) => {
    return (
        <div className="flex flex-row space-x-3 items-center">
            <img className="w-20 h-20" src={coverUrl} alt={`Cover de ${title}`}/>

            <div className="flex flex-col justify-center">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-300 font-light">{authors}</p>
            </div>
        </div>
    )
}

export default CurrentSong