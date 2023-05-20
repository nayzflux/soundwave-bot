import {atom, RecoilState} from "recoil";
import {SpotifyPlaylist} from "@/types/spotifyPlaylist";

const spotifyPlaylistsState: RecoilState<SpotifyPlaylist[] | null> = atom<SpotifyPlaylist[] | null>({
    key: 'spotifyPlaylistsState', // unique ID (with respect to other atoms/selectors)
    default: null
});

export default spotifyPlaylistsState;