import {useEffect} from "react";
import {fetchSpotifyPlaylists} from "@/utils/api";
import {useRecoilState} from "recoil";
import spotifyPlaylistsState from "@/atoms/spotifyPlaylistsAtom";
import SpotifyPlaylistItem from "@/components/SpotifyPlaylistItem";

const SpotifyPlaylistContainer = () => {
    const [spotifyPlaylists, setSpotifyPlaylists] = useRecoilState(spotifyPlaylistsState)

    useEffect(() => {
        fetchSpotifyPlaylists().then(playlists => {
            if (playlists) {
                setSpotifyPlaylists(playlists);
            }
        })
    }, []);

    return (
        <div className="flex flex-row items-center space-x-3">
            {spotifyPlaylists?.map((playlist) => {
                return(
                    <SpotifyPlaylistItem key={playlist.id} owner={playlist.owner.display_name} id={playlist.id} name={playlist.name} description={playlist.description} imageUrl={playlist.images[0].url} url={playlist.external_urls.spotify}/>
                )
            })}
        </div>
    )
}
export default SpotifyPlaylistContainer;