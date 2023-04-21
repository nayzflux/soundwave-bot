/**
 * @author NayZ
 * Interface de les playlists
 */

interface MyPlaylist {
    url: string;
    title: string;
    totalSongs: number;
    songs: MySong[];
}