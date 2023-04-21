/**
 * @author NayZ
 * Fichier responsable de la gestion de la musique
 */

import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, AudioResource, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import MyQueue from '../types/queue';

// Ou les fichiers seront télécharger
const DOWNLOAD_PATH = `./temp/musics/`;

export const clearText = (text: string): string => {
    /** 
     * ChatGPT
     * D'accord, voici une expression régulière en JavaScript qui supprime tous les caractères spéciaux sauf les espaces, les tirets de bas et les tirets, les @, le point et le caractère # :
     */
    return text.replace(/[^\w\s-@.#]/g, '');
}

export const queues: Map<string, MyQueue> = new Map();

export const disconnect = (channel) => {
    const connection = getVoiceConnection(channel.guild.id);
    connection.destroy();
    console.log(`💨 Disconnected from ${channel.name}`);
}

export const play = (channel, song: MySong) => {
    const queue: MyQueue = queues.get(channel.guildId);

    if (!queue) {
        // Se connecter
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        // En cas de deconnexion
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                console.log(`❌ Error on ${channel.name}`);
                subscription.unsubscribe();
                disconnect(channel);
                player.stop();
                queues.set(channel.guildId, null);
                console.log(`⏹️ Player stopped ${channel.name}`);
            }
        });

        console.log(`🆗 Connected to ${channel.name}`);

        // Créer le lecteur
        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);

        console.log(`🆗 Audio player created`);

        // Charger la musique
        const resource: AudioResource = createAudioResource(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`);

        console.log(`🆗 Audio resource created for ${song.title}`);

        // Créer la file de lecture
        queues.set(channel.guildId, { player, connection, resources: [resource] });

        // Lancer le lecteur
        player.play(resource);

        console.log(`🎵 Playing on ${channel.name}...`);

        // ===== Quand le lecteur ne joue plus =====
        let isIdle = false;

        player.on(AudioPlayerStatus.Idle, () => {
            console.log(`🤖 IDLE`);
            // Attendre 3 seondes avant de passer à la musique suivante si il n'y a pas de musique suivante se déconnecter
            if (!isIdle) {
                console.log(`⏹️ Player skip to next song in 3s on ${channel.name}...`);
                isIdle = true;
                setTimeout(() => {
                    // Si le lecteur a repris annuler
                    if (!AudioPlayerStatus.Idle) {
                        console.log(`⏹️ Player skip cancelled on ${channel.name}`);
                        isIdle = false;
                        return;
                    }

                    // Jouer le prochain song
                    const actualQueue: MyQueue = queues.get(channel.guildId);
                    actualQueue.resources.shift();

                    console.log(`🗑️ Previous song removed from queue`);

                    // Si il reste des musiques les jouers sinon se déconnecter
                    if (actualQueue.resources?.length >= 1) {
                        player.play(actualQueue.resources[0]);
                        isIdle = false
                    } else {
                        subscription.unsubscribe();
                        disconnect(channel);
                        player.stop();
                        queues.set(channel.guildId, null);
                        console.log(`⏹️ Player stopped ${channel.name}`);
                        isIdle = false;
                    }
                }, 3_000);
            }
        });
    } else {
        // Charger la musique
        const resource: AudioResource = createAudioResource(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`);
        queue.resources.push(resource)
        console.log(`🆗 Audio resource created for ${song.title}`);
    }
}