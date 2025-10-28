export function humanizeDateTime(datetime: string) {
    const date = new Date(datetime.replace('Z', ''));  // Not working with Z at the end (UTC)
    const dateTimeFormat = new Intl.DateTimeFormat('ru', {
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',  // Fix for Z
        hour: 'numeric',
        minute: 'numeric'
    });
    return dateTimeFormat.format(date);
}