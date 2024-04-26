const CAR_DATA_URL = 'https://storage.googleapis.com/tfjs-tutorials/carsData.json';

/**
 * Obteniene datos de automóviles, elimina campos
 * innecesarios y elementos vacíos.
 */
export async function getData() {
    const carsDataResponse = await fetch(CAR_DATA_URL);
    const carsData = await carsDataResponse.json();
    const cleaned = carsData
    .filter(car => (car.Horsepower != null && car.Miles_per_Gallon != null))
    .map(car => {
        return {
            mpg: car.Miles_per_Gallon,
            horsepower: car.Horsepower
        }
    });

    return cleaned;
}