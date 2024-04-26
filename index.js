import { getData } from "./data.js";
import { renderScatterPlot } from "./graphics.js";
import { convertToTensor, createModel, testModel, trainModel } from "./model.js";

const data = await getData();
const asPoints = data.map((d) => ({
  x: d.horsepower,
  y: d.mpg,
}));

renderScatterPlot(asPoints, {
  graphicName: "Horsepower vs MPG",
  labelX: "Horsepower",
  labelY: "MPG",
});

const model = createModel();
tfvis.show.modelSummary({
    name: 'Model summary'
}, model);

const { inputs, labels, ...rest } = await convertToTensor(asPoints);

await trainModel(model, inputs, labels);
console.log('Entrenamiento completado');

await testModel(model, asPoints, rest);
console.log('Prueba terminada.');