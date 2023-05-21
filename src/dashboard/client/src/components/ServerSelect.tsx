"use client"

import {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import {fetchUserGuilds} from "@/utils/api";
import isInVoiceChannelState from "@/atoms/isInVoiceChannelAtom";
import isLoggedBotInvitedState from "@/atoms/isBotInvitedAtom";
import isLoggedState from "@/atoms/isLogged";

const ServerSelect = () => {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [guild, setGuild] = useRecoilState(guildState);

    const [isInVoiceChannel, setIsInVoiceChannel] = useRecoilState(isInVoiceChannelState);
    const [isLogged, setIsLogged] = useRecoilState(isLoggedState);
    const [isBotInvited, setIsBotInvited] = useRecoilState(isLoggedBotInvitedState);

    useEffect(() => {
        fetchUserGuilds().then(data => {
            // Nous sommes connecté
            setIsLogged(true);
            // Le bot est présent sur les serveurs
            setIsBotInvited(true)

            // Ajouter les serveurs à la listes
            setGuild(data[0]);
            setGuilds(data);
        }).catch(response => {
            // Si on n'est pas authentifié
            if (response.status === 401) {
                setIsLogged(false);
            }

            // Si le bot n'est présent sur aucun serveur de l'utilisateur
            if (response.status === 404) {
                setIsBotInvited(false);
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