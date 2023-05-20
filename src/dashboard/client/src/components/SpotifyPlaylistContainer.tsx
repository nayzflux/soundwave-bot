import {useEffect, useState} from "react";
import {fetchSpotifyPlaylists} from "@/utils/api";
import {useRecoilState} from "recoil";
import spotifyPlaylistsState from "@/atoms/spotifyPlaylistsAtom";
import SpotifyPlaylistItem from "@/components/SpotifyPlaylistItem";
import {useRouter} from "next/navigation";

const SpotifyPlaylistContainer = () => {
    const [spotifyPlaylists, setSpotifyPlaylists] = useRecoilState(spotifyPlaylistsState)
    const [loggedWithSpotify, setLoggedWithSpotify] = useState(true);
    const router = useRouter()

    useEffect(() => {
        fetchSpotifyPlaylists().then(playlists => {
            if (playlists) {
                setSpotifyPlaylists(playlists);
            }

            if (!playlists) {
                setLoggedWithSpotify(false);
            }
        })
    }, []);

    return (
        <div className="flex flex-row items-center space-x-3">
            {loggedWithSpotify ? spotifyPlaylists?.map((playlist) => {
                return(
                    <SpotifyPlaylistItem key={playlist.id} owner={playlist.owner.display_name} id={playlist.id} name={playlist.name} description={playlist.description} imageUrl={playlist.images[0].url} url={playlist.external_urls.spotify}/>
                )
            }) : <div className="w-full h-54 flex flex-col items-center justify-center space-y-3"><p className="font-semibold text-lg">We can't retrieve your Spotify playlist</p><p>You've not linked your Spotify Account yet</p><button className="rounded-lg font-semibold active:scale-95 transition-all ease-out duration-700 px-3 py-2 bg-green-500 hover:shadow-green-400 hover:shadow-2xl" onClick={(e) => router.push((process.env.NEXT_PUBLIC_API_URL || 'https://api.soundwave.nayz.fr/api') + '/spotify/login')}>Link Spotify Account</button></div>}
        </div>
    )
}
export default SpotifyPlaylistContainer;