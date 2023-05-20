export function convertirTemps(ms: number): string {
    const secondes = Math.floor(ms / 1000);
    const heures = Math.floor(secondes / 3600);
    const minutes = Math.floor((secondes % 3600) / 60);
    const secondesRestantes = secondes % 60;

    const tempsFormaté = [];

    if (heures > 0) {
        tempsFormaté.push(`${heures.toString().padStart(2, '0')}`);
    }

    if (minutes > 0 || heures > 0) {
        tempsFormaté.push(`${minutes.toString().padStart(2, '0')}`);
    }

    tempsFormaté.push(`${secondesRestantes.toString().padStart(2, '0')}`);

    return tempsFormaté.join(':');
}