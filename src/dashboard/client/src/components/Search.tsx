import React, {useCallback, useEffect, useState} from "react";
import {debounce}  from 'lodash';
import {searchSongs} from "@/utils/api";
import {useRecoilState} from "recoil";
import guildState from "@/atoms/guildAtom";
import SearchSongItem from "@/components/SearchSongItem";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {useRouter} from "next/navigation";
import isInVoiceChannelState from "@/atoms/isInVoiceChannelAtom";
import SpotifyPlaylistContainer from "@/components/SpotifyPlaylistContainer";
import isLoggedBotInvitedState from "@/atoms/isBotInvitedAtom";
import Unauthenticated from "@/components/errors/Unauthenticated";
import InviteBot from "@/components/errors/InviteBot";
import NotInVoiceChannel from "@/components/errors/NotInVoiceChannel";
import isLoggedState from "@/atoms/isLogged";

const Search = () => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [guild, setGuild] = useRecoilState(guildState);
    const router = useRouter();

    const [isInVoiceChannel, setIsInVoiceChannel] = useRecoilState(isInVoiceChannelState);
    const [isLogged, setIsLogged] = useRecoilState(isLoggedState);
    const [isBotInvited, setIsBotInvited] = useRecoilState(isLoggedBotInvitedState);

    useEffect(() => {
        debounceSearch(input, guild);
    }, [input, guild]);

    const debounceSearch = useCallback(
        debounce((query: string, guild: Guild | null) => {
            console.log(query, guild?.id)

            if (query === '') {
                return setResults([])
            }

            if (!guild?.id) {
                return setResults([])
            }

            setLoading(true);

            searchSongs(guild.id, query).then(response => {
                setIsInVoiceChannel(true);
                // @ts-ignore
                setResults(response);
                setLoading(false)
            }).catch(response => {
                console.log(response.status)
                // Si nous ne sommes pas dans un salon vocal du serveur
                if (response.status === 400) {
                    setIsInVoiceChannel(false);
                }
            })
        }, 500), []
    );

    // @ts-ignore
    return (
        <div className="flex flex-col items-center bg-soft-gray py-3 flex-grow">
            <div className="bg-light-gray p-3 rounded-full w-2/3 flex flex-row space-x-4 items-center">
                <MagnifyingGlassIcon className="w-6 h-6"/>
                <input className="bg-transparent outline-none" placeholder='Search a song...' value={input} onChange={(e) => setInput(e.target.value)} />
            </div>
            {
                !isLogged ? <Unauthenticated/> :
                    !isBotInvited ? <InviteBot/> :
                        !isInVoiceChannel ? <NotInVoiceChannel/> :
                            <div className={`flex flex-col text-white truncate space-y-2 w-full h-full p-6 ${isInVoiceChannel ? "" : "cursor-not-allowed"}`}>
                                {results?.length >= 1 ? results?.map((item: SearchSong, index) => (
                                    <SearchSongItem key={`${index}-${item.name}`} name={item.name} authors={item.artists.map(artist => artist.name).toString()} url={item.external_urls.spotify} durationMs={item.duration_ms} coverUrl={item.album?.images[0].url} explicit={item.explicit}/>
                                )) : <SpotifyPlaylistContainer/>}
                            </div>
            }
        </div>
    );
}

export default Search