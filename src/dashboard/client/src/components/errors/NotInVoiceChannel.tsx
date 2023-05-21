import React from "react";
import {useRouter} from "next/navigation";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import Link from "next/link";

const NotInVoiceChannel = () => {
    const router = useRouter();
    const [guild, setGuild] = useRecoilState(guildState)

    return <div className="flex flex-grow justify-center items-center flex-col space-y-4 cursor-default">
        <p className="text-xl font-bold">You're currently not in voice channel on {guild?.name}!</p>

        <p className="text-lg text-center ">
            You need to be in a voice channel to play music
        </p>

        <Link href={(process.env.NEXT_PUBLIC_API_URL || 'https://api.soundwave.nayz.fr/api') + '/auth/login'} className="text-xs text-blue-600 underline ml-auto">You're in voice channel but this message appear?</Link>
    </div>
}

export default NotInVoiceChannel;