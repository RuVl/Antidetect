import { checkBrowser } from "@/checkBrowser.ts";

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

export async function lookForAntidetect(): Promise<boolean> {
    const { isWebDriver, score, reasons, fingerprint, details } = await checkBrowser();

    for (const reason of reasons) {
        console.warn(`Suspicious: ${reason}`);
    }
    if (reasons.length) console.debug(`Score: ${score}`);

    console.info(`Fingerprint: ${fingerprint}`);
    console.debug(details);

    return isWebDriver;
}