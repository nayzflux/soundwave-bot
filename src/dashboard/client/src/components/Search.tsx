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

const Search = () => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [guild, setGuild] = useRecoilState(guildState);
    const [isInVoiceChannel, setIsOnVoiceChannel] = useRecoilState(isInVoiceChannelState);
    const router = useRouter();

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
                // @ts-ignore
                setIsOnVoiceChannel(response?.inVoiceChannel);
                // @ts-ignore
                setResults(response?.songs);
                setLoading(false)
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
            {isInVoiceChannel ?
                <div className={`flex flex-col text-white truncate space-y-2 w-full h-full p-6 ${isInVoiceChannel ? "" : "cursor-not-allowed"}`}>
                    {results?.length >= 1 ? results?.map((item: SearchSong, index) => (
                        <SearchSongItem key={`${index}-${item.name}`} name={item.name} authors={item.artists.map(artist => artist.name).toString()} url={item.external_urls.spotify} durationMs={item.duration_ms} coverUrl={item.album?.images[0].url} explicit={item.explicit}/>
                    )) : <SpotifyPlaylistContainer/>}
                </div> :
                <div className="flex flex-grow justify-center items-center flex-col space-y-4 cursor-default">
                    <p className="text-xl font-bold">You MUST be in VOICE channel to play music</p>

                    <p className="text-lg text-center ">
                        You are connected in a voice<br/>
                        channel but this message appear?
                    </p>

                    <button className="hover:shadow-2xl bg-blue-600 hover:shadow-blue-500 px-3 py-2 rounded-lg font-semibold active:scale-95 transition-all ease-out duration-700" onClick={() => router.push('http://localhost:5000/api/auth/login')}>Login With Discord</button>
                </div>
            }
        </div>
    );
}

export default Search