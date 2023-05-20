/**
 * @author NayZ
 * Interface pour la file de lecture
 */

import { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";

export default interface MyQueue {
    player: AudioPlayer;
    connection: VoiceConnection;
    resources: AudioResource[];
    songs: MySong[]
    isPlaying: boolean
}