/**
 * @author NayZ
 * Fichier responsable de la gestion de la musique
 */

import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, AudioResource, entersState, VoiceConnectionStatus, AudioPlayer } from '@discordjs/voice';
import MyQueue from '../types/queue';
import fs from 'fs';

// Ou les fichiers seront télécharger
const DOWNLOAD_PATH = `./temp/musics/`;

// Supprimer les caractères spéciaux des noms des fichiers
export const clearText = (text: string): string => {
    /** 
     * ChatGPT
     * D'accord, voici une expression régulière en JavaScript qui supprime tous les caractères spéciaux sauf les espaces, les tirets de bas et les tirets, les @, le point et le caractère # :
     */
    return text.replace(/[^\w\s-@.#]/g, '');
}

export const queues: Map<string, MyQueue> = new Map();

// Arreter la musique
export const stop = (guildId: string) => {
    const queue: MyQueue = queues.get(guildId);
    if (!queue) return;

    const connection = queue.connection;
    connection.disconnect();
    connection.destroy();

    const player = queue.player;
    player.stop();

    queues.set(guildId, null);

    console.log(`⏹️ Player stopped`);
}

// Jouer de la musique
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
                subscription.unsubscribe();
                stop(channel.guildId);
            }
        });

        console.log(`🆗 Connected to ${channel.name}`);

        // Créer le lecteur
        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);

        console.log(`🆗 Audio player created`);

        // Charger la musique
        const resource: AudioResource = createAudioResource(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`);
        console.log(resource.playbackDuration);

        console.log(`🆗 Audio resource created for ${song.title}`);

        // Créer la file de lecture
        queues.set(channel.guildId, { player, connection, resources: [resource] });

        // Lancer le lecteur
        player.play(resource);

        console.log(`🎵 Playing on ${channel.name}...`);

        // ===== Quand le lecteur ne joue plus =====
        // let isIdle = false;

        player.on(AudioPlayerStatus.Idle, () => {
            console.log(`🤖 IDLE`);
            // Attendre 3 seondes avant de passer à la musique suivante si il n'y a pas de musique suivante se déconnecter
            // if (!isIdle) {
            console.log(`⏹️ Player skip to next song on ${channel.name}...`);
            // isIdle = true;
            // setTimeout(() => {
            // Si le lecteur a repris annuler
            // if (!AudioPlayerStatus.Idle) {
            //     console.log(`⏹️ Player skip cancelled on ${channel.name}`);
            //     isIdle = false;
            //     return;
            // }

            // Jouer le prochain song
            const actualQueue: MyQueue = queues.get(channel.guildId);
            actualQueue.resources.shift();

            console.log(`🗑️ Previous song removed from queue`);

            // Si il reste des musiques les jouers sinon se déconnecter
            if (actualQueue.resources?.length >= 1) {
                player.play(actualQueue.resources[0]); // jouer la ressource
                // isIdle = false
            } else {
                subscription.unsubscribe();
                stop(channel.guildId);
                // isIdle = false;
            }
            // }, 3_000);
            // }
        });
    } else {
        // Charger la musique
        const resource: AudioResource = createAudioResource(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`);
        queue.resources.push(resource); // ajouter la musique à la file de lecture
        console.log(`🆗 Audio resource created for ${song.title}`);
    }
}

// Si le lecteur est en lecture ou en pause
export const isPlaying = (guildId: string): boolean => {
    const queue = queues.get(guildId);
    if (queue?.player?.state?.status === AudioPlayerStatus.Playing) return true;
    if (queue?.player?.state?.status === AudioPlayerStatus.Paused) return true;
    else return false
}

// Si le lecteur est en pause
export const isPaused = (guildId: string): boolean => {
    const queue = queues.get(guildId);
    if (queue?.player?.state?.status === AudioPlayerStatus.Paused) return true;
    else return false
}

// Passer x musique
export const skip = (guildId: string, amount: number): void => {
    const queue = queues.get(guildId);
    queue?.resources?.splice(1, amount - 1); // supprimer la prochaine musique jusqu'à la x ième musique
    queue?.player?.stop(); // arreter la lecture pour passer à la suivante
    console.log("⏭️ " + amount + " song(s) skipped");
}

// Supprimer toutes les musique ne passe pas à la prochaine
export const clear = (guildId: string): void => {
    const queue = queues.get(guildId);
    queue?.resources?.splice(1, queues.get(guildId)?.resources?.length - 1); // supprimer de la prochaine à la dernière musique

    console.log("⏭️ Queue cleared");
}


export const getQueue = (guildId: string): MyQueue => {
    const queue = queues.get(guildId);
    return queue || null;
}

// Mettre pause et enlever la pause
export const togglePause = (guildId: string): void => {
    const queue = queues.get(guildId);
    // si le lecteur n'est pas en pause
    if (!isPaused(guildId)) {
        queue?.player?.pause(); // mettre en pause la lecture
        console.log("⏯️ Player paused");
    } else {
        queue?.player?.unpause(); // reprendre la lecture
        console.log("⏯️ Player unpaused");
    }
}

// Laver et créer les fichiers temp
export const init = () => {
    if (!fs.existsSync(`./temp`)) fs.mkdirSync(`./temp`);

    if (!fs.existsSync(`./temp/musics`)) fs.mkdirSync(`./temp/musics`);

    // Supprimer tous les anciens fichiers audio
    const files = fs.readdirSync(DOWNLOAD_PATH);
    for (const filename of files) {
        fs.unlinkSync(`${DOWNLOAD_PATH}${filename}`)
    }
}