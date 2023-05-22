"use client"

import CurrentSong from "@/components/CurrentSong";
import Control from "@/components/Control";
import Progress from "@/components/Progress";
import {useRecoilState} from "recoil";
import queueState from "@/atoms/queueAtom";
import React from "react";

const Player = () => {
    const [queue, setQueue] = useRecoilState(queueState);

    return (
        <div className="flex flex-row justify-between p-3 bg-dark-gray w-full fixed bottom-0">
                {queue?.songs?.length >= 1 ?
                    <CurrentSong title={queue.songs[0].name} authors={queue.songs[0].authors} coverUrl={queue.songs[0].coverUrl}/>
                    : null}
            <div className="flex flex-col flex-grow items-center space-y-3">
                <Control/>
                <Progress/>
            </div>
        </div>
    )
}

export default Player