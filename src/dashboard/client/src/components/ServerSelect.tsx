"use client"

import {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import {fetchUserGuilds} from "@/utils/api";

const ServerSelect = () => {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [guild, setGuild] = useRecoilState(guildState);

    useEffect(() => {
        fetchUserGuilds().then(data => {
            if (data[0]) {
                setGuild(data[0]);
                setGuilds(data);
            }
        })
    }, [])

    const handleChange = (e: any) => {
        e.preventDefault();
        const selected = guilds.find(g => g.id === e.target.value);
        if (!selected) return;
        setGuild(selected);
    }

    return(
        <select className="bg-soft-gray w-full rounded h-10" onChange={handleChange}>
            {guilds?.map(g => {
                return(
                    <option value={g?.id} key={g?.id}>
                        {g.name}
                    </option>
                )
            })}
        </select>
    )
}

export default ServerSelect