export function humanizeDateTime(datetime: string) {
    const date = new Date(datetime.replace('Z', ''));  // Not working with Z at the end (UTC)
    const dateTimeFormat = new Intl.DateTimeFormat('ru', {
        month: 'long',
        day: 'numeric',
        timeZone: 'Etc/GMT-3',  // Fix for Z (now in UTC)
        hour: 'numeric',
        minute: 'numeric'
    });
    return dateTimeFormat.format(date);
}

// https://blog.castle.io/anti-detect-browser-analysis-how-to-detect-the-undetectable-browser/
export async function lookForAntidetect(): Promise<boolean> {
    return false;
}