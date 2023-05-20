"use client"

import ServerSelect from "@/components/ServerSelect";
import {useRecoilState} from "recoil";
import queueState from "@/atoms/queueAtom";
import SongItem from "@/components/SongItem";
import {useEffect} from "react";
import {fetchGuildQueue} from "@/utils/api";
import guildState from "@/atoms/guildAtom";
import {socket} from "@/utils/socket";

const Sidebar = () => {
    const [queue, setQueue] = useRecoilState(queueState);
    const [guild, setGuild] = useRecoilState(guildState);

    useEffect(() => {
        if (!guild) return;

        fetchGuildQueue(guild.id).then((response) => {
            if (!response) return setQueue({songs: [], isPlaying: false});
            // @ts-ignore
            setQueue({isPlaying: response?.data?.isPlaying, songs: response?.data?.songs?.map((song) => ({name: song.name, durationMs: song.durationMs, coverUrl: song.coverUrl, authors: song.authors}))})
        });

        socket.on('play', handleEvent);
        socket.on('skip', handleEvent);
        socket.on('pause', handleEvent);
        socket.on('stop', handleEvent);
        socket.on('clear', handleEvent);

        return(() => {
            socket.off('play', handleEvent);
            socket.off('skip', handleEvent);
            socket.off('pause', handleEvent);
            socket.off('stop', handleEvent);
            socket.off('clear', handleEvent);
        })
    }, [guild]);

    // @ts-ignore
    const handleEvent = (guildId, queue) => {
        // Si le changement n'est pas pour le serveur actuel
        if (guildId !== guild?.id) return;
        // @ts-ignore
        setQueue({isPlaying: queue.isPlaying, songs: queue.songs?.map((song) => ({name: song.name, durationMs: song.durationMs, coverUrl: song.coverUrl, authors: song.authors}))})
    }

    useEffect(() => {
        console.log("Queue updated")
        console.log(queue)
    }, [queue])

    return(
        <div className="flex flex-col w-[280px] max-w-[300px] items-center p-3 bg-light-gray space-y-4">
            <div className="flex flex-row space-x-3 items-center">
                <img className="w-12 h-12 rounded-full" src="/logo.png" alt="Logo"/>
                <h1 className="text-3xl font-bold">SOUNDWAVE</h1>
            </div>

            <div className="w-full h-1 rounded-full opacity-30 bg-gray-300"></div>

            <ServerSelect/>

            <div className="w-full h-1 rounded-full opacity-30 bg-gray-300"></div>

            <div className="flex flex-col space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide w-full">
                {queue?.songs?.map((song, i) => (
                    <SongItem key={i + "-" +  song.name} rank={i + 1} name={song.name} authors={song.authors} durationMs={song.durationMs} coverUrl={song.coverUrl}/>
                ))}
            </div>
        </div>
    )
}

export default Sidebar