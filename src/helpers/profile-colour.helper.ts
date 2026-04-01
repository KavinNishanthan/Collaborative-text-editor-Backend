/**
 * @createdBy Kavin Nishanthan P D
 * @createdAt 2026-04-01
 * @description This function is used to Select BG Color for ProfilePicture
 */

export const generateColor = (name: string) => {
   
    const colors = [
    "ff5733", "33ff57", "3357ff", "ff33a8", "a833ff",
    "ff8c00", "00bfff", "ff1493", "7fff00", "8a2be2",
    "ff6347", "40e0d0", "ffd700", "adff2f", "ff69b4",
    "00fa9a", "1e90ff", "ff4500", "da70d6", "32cd32",
    "ba55d3", "cd5c5c", "20b2aa", "ffb6c1", "87cefa",
    "ffa500", "6a5acd", "00ced1", "ff7f50", "9acd32",
    "ff00ff", "00ffcc", "ccff00", "ffcc00", "3366ff",
    "9933ff", "ff3366", "33cc33", "0099ff", "ff9966"
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export default {
    generateColor
}