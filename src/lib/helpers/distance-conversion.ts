const DECIMAL = 1;


export const width = 7182;
export const height = 7182;

export const pxToFeet = 65 * 12;
export const strikeZoneCenter = {
    x : width / 2,
    y : 4395.5
};

export function toFeet(pxX: number, pxY: number) {
    // distance from strike zone center in feet
    const xFeet = (pxX - strikeZoneCenter.x) / pxToFeet;
    const yFeet = (strikeZoneCenter.y - pxY) / pxToFeet;

    return { x: Number(xFeet.toFixed(DECIMAL)), y: Number(yFeet.toFixed(DECIMAL)) };
}

export function toSvgCoords(xFeet: number, yFeet: number) {
    const pxX = xFeet * pxToFeet + strikeZoneCenter.x;
    const pxY = strikeZoneCenter.y - yFeet * pxToFeet;

    return { x: pxX, y: pxY };
}
