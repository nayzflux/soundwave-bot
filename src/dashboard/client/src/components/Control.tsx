"use client"

import {PauseCircleIcon, PlayCircleIcon, StopIcon} from "@heroicons/react/24/solid";
import {ForwardIcon, TrashIcon} from "@heroicons/react/24/outline";
import {useState} from "react";
import {onClear, onPause, onPlay, onSkip, onStop} from "@/utils/socket";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import queueState from "@/atoms/queueAtom";
import isInVoiceChannelState from "@/atoms/isInVoiceChannelAtom";

const Control = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [guild, setGuild] = useRecoilState(guildState);
    const [queue, setQueue] = useRecoilState(queueState);
    const [isInVoiceChannel, setIsInVoiceChannel] = useRecoilState(isInVoiceChannelState);

    const setPlaying = () => {
        setIsPlaying(true);
    }

    const setPaused = () => {
        setIsPlaying(false);
    }

    const handlePlayButton = (e: any) => {
        e.preventDefault();

        if (!guild) return;

        if (isPlaying) {
            setPaused()
            onPause(guild.id)
        } else {
            setPlaying()
            onPlay(guild.id)
        }
    }

    const handleSkipButton = (e: any) => {
        e.preventDefault();
        if (!guild) return;
        onSkip(guild.id)
    }

    const handleStopButton = (e: any) => {
        e.preventDefault();
        if (!guild) return;
        onStop(guild.id)
    }

    const handleClearButton = (e: any) => {
        e.preventDefault();
        if (!guild) return;
        onClear(guild.id)
    }

    return (
        <div className="flex flex-row space-x-3 text-gray-300 ">
            <button className="active:scale-95 transition-all duration-400 ease-out disabled:cursor-not-allowed" onClick={handleClearButton} disabled={!isInVoiceChannel}>
                <TrashIcon className="w-8 h-8 hover:text-red-400 hover:drop-shadow-xl transition-all duration-300 ease-out"/>
            </button>

            <button className="active:scale-95 transition-all duration-400 ease-out disabled:cursor-not-allowed" onClick={handleStopButton} disabled={!isInVoiceChannel}>
                <StopIcon className="w-10 h-10 hover:text-red-400 hover:drop-shadow-xl transition-all duration-300 ease-out"/>
            </button>

            <button className="active:scale-95 transition-all duration-400 ease-out disabled:cursor-not-allowed" onClick={handlePlayButton} disabled={!isInVoiceChannel}>
                {queue?.isPlaying ?
                    <PauseCircleIcon className="w-14 h-14 hover:text-gray-100 hover:drop-shadow-xl transition-all duration-300 ease-out"/>
                    :
                    <PlayCircleIcon className="w-14 h-14 hover:text-gray-100 hover:drop-shadow-xl transition-all duration-300 ease-out"/>
                }
            </button>

            <button className="active:scale-95 transition-all duration-400 ease-out disabled:cursor-not-allowed" onClick={handleSkipButton} disabled={!isInVoiceChannel}>
                <ForwardIcon className="w-10 h-10 hover:text-gray-100 hover:drop-shadow-xl transition-all duration-300 ease-out"/>
            </button>
        </div>
    )
}

export default Control