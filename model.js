/**
 * Crea y retorna un modelo secuencial de TensorFlow.js.
 */
export function createModel() {
    const model = tf.sequential({
        layers: [
            tf.layers.dense({ inputShape: [1], units: 1, useBias: true }),
            tf.layers.dense({ activation: 'sigmoid', units: 80 }),
            tf.layers.dense({ activation: 'relu', units: 50 }),
            tf.layers.dense({ activation: 'sigmoid', units: 50 }),
            tf.layers.dense({ units: 1, useBias: true }),
        ]
    });

    return model;
}

/**
 * Convierte a tensor una serie de datos, normalizándolos y
 * reordenándolos.
 * 
 * @param {[{ x: number, y: number }]} data
 */
export async function convertToTensor(data) {
    return tf.tidy(() => {
        tf.util.shuffle(data);
        const inputs = data.map(d => d.x);
        const labels = data.map(d => d.y);

        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelMax = labelTensor.max();
        const labelMin = labelTensor.min();

        // Normalizar los tensores para que caigan en el rango 0 - 1.
        // Para ello, se los resta por el mínimo y se los divide por la diferencia
        // entre el máximo y el mínimo.
        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

        return {
            inputs: normalizedInputs,
            labels: normalizedLabels,
            inputMax,
            inputMin,
            labelMax,
            labelMin,
        }
    });
}

export async function trainModel(model, inputs, labels) {
    model.compile({
        loss: tf.losses.meanSquaredError,
        optimizer: tf.train.adam(),
        metrics: ['mse'],
    });

    const BATCH_SIZE = 32;
    const EPOCHS = 300;

    return model.fit(inputs, labels, {
        batchSize: BATCH_SIZE,
        epochs: EPOCHS,
        // Visualizar el entrenamiento del modelo
        callbacks: tfvis.show.fitCallbacks(
            { name: 'Rendimiento del entrenamiento' },
            ['loss', 'mse'],
            { height: 200, callbacks: ['onEpochEnd'] }
        )
    });
}

export async function testModel(model, inputData, normalizationData) {
    const {
        labelMin,
        labelMax,
        inputMin,
        inputMax
    } = normalizationData;

    const [xs, predictions] = tf.tidy(() => {
        // Generar puntos de prueba en el intervalo 0 a 1.
        const xs = tf.linspace(0, 1, 100);
        console.log("shape: ", xs.shape) 
        const preds = model.predict(xs.reshape([100, 1]));

        const unNormXs = xs
            .mul(inputMax.sub(inputMin))
            .add(inputMin);
        
        const unNormPreds = preds
            .mul(labelMax.sub(labelMin))
            .add(labelMin);
        
        return [
            unNormXs.dataSync(),
            unNormPreds.dataSync()
        ];
    });

    const predictedPoints = Array.from(xs).map((x, i) => {
        return { x, y: predictions[i] };
    });

    tfvis.render.scatterplot(
        { name: 'Predicciones vs Datos Originales' },
        { values: [predictedPoints, inputData], series: ["predecido", "original"] },
        {
            xLabel: 'Horsepower',
            yLabel: 'MPG',
            height: 300
        }
    );
}