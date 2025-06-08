export const Get_DIGIPIN = (lat, lon) => {
    const L = [
        ['F', 'C', '9', '8'],
        ['J', '3', '2', '7'],
        ['K', '4', '5', '6'],
        ['L', 'M', 'P', 'T']
    ];
    let vDIGIPIN = '';
   
    //variable for identification of row and column of the cells
    let row = 0, column = 0;
    // Bounding Box Extent
    let MinLat = 2.5, MaxLat = 38.50, MinLon = 63.50, MaxLon = 99.50;
    let LatDivBy = 4, LonDivBy = 4;
    let LatDivDeg = 0, LonDivDeg = 0;

    if (lat < MinLat || lat > MaxLat) {
        throw new Error('Latitude Out of range');
    }
    if (lon < MinLon || lon > MaxLon) {
        throw new Error('Longitude Out of range');
    }

    for (let Lvl = 1; Lvl <= 10; Lvl++) {
        LatDivDeg = (MaxLat - MinLat) / LatDivBy;
        LonDivDeg = (MaxLon - MinLon) / LonDivBy;
        let NextLvlMaxLat = MaxLat;
        let NextLvlMinLat = MaxLat - LatDivDeg;

        for (let x = 0; x < LatDivBy; x++) {
            if (lat >= NextLvlMinLat && lat < NextLvlMaxLat) {
                row = x;
                break;
            } else {
                NextLvlMaxLat = NextLvlMinLat;
                NextLvlMinLat = NextLvlMaxLat - LatDivDeg;
            }
        }

        let NextLvlMinLon = MinLon;
        let NextLvlMaxLon = MinLon + LonDivDeg;
        for (let x = 0; x < LonDivBy; x++) {
            if (lon >= NextLvlMinLon && lon < NextLvlMaxLon) {
                column = x;
                break;
            } else if ((NextLvlMinLon + LonDivDeg) < MaxLon) {
                NextLvlMinLon = NextLvlMaxLon;
                NextLvlMaxLon = NextLvlMinLon + LonDivDeg;
            } else {
                column = x;
            }
        }
   
        if (Lvl === 1) {
            if (L[row][column] === "0") {
                return "Out of Bound";
            }
        }
        vDIGIPIN = vDIGIPIN + L[row][column];
   
        if (Lvl === 3 || Lvl === 6) {
            vDIGIPIN = vDIGIPIN + "-";
        }
   
        // Set Max boundary for next level
        MinLat = NextLvlMinLat;
        MaxLat = NextLvlMaxLat;
        MinLon = NextLvlMinLon;
        MaxLon = NextLvlMaxLon;
    }
    return vDIGIPIN;
};

export const Get_LatLng_By_Digipin = (vDigiPin) => {
    vDigiPin = vDigiPin.replaceAll('-', '');
    if (vDigiPin.length !== 10) {
        throw new Error("Invalid DIGIPIN");
    }

    const L = [
        ['F', 'C', '9', '8'],
        ['J', '3', '2', '7'],
        ['K', '4', '5', '6'],
        ['L', 'M', 'P', 'T']
    ];

    let MinLat = 2.50, MaxLat = 38.50, MinLng = 63.50, MaxLng = 99.50;
    let LatDivBy = 4, LngDivBy = 4;
    let LatDivVal = 0, LngDivVal = 0;
    let ri, ci, f;
    let Lat1, Lat2, Lng1, Lng2;

    for (let Lvl = 0; Lvl < 10; Lvl++) {
        ri = -1;
        ci = -1;
        const digipinChar = vDigiPin.charAt(Lvl);
        LatDivVal = (MaxLat - MinLat) / LatDivBy;
        LngDivVal = (MaxLng - MinLng) / LngDivBy;
        f = 0;

        for (let r = 0; r < LatDivBy; r++) {
            for (let c = 0; c < LngDivBy; c++) {
                if (L[r][c] === digipinChar) {
                    ri = r;
                    ci = c;
                    f = 1;
                    break;
                }
            }
            if (f === 1) break;
        }

        if (f === 0) {
            throw new Error('Invalid DIGIPIN');
        }

        Lat1 = MaxLat - (LatDivVal * (ri + 1));
        Lat2 = MaxLat - (LatDivVal * ri);
        Lng1 = MinLng + (LngDivVal * ci);
        Lng2 = MinLng + (LngDivVal * (ci + 1));

        MinLat = Lat1;
        MaxLat = Lat2;
        MinLng = Lng1;
        MaxLng = Lng2;
    }

    const cLat = (Lat2 + Lat1) / 2;
    const cLng = (Lng2 + Lng1) / 2;

    return { latitude: cLat, longitude: cLng };
}; 