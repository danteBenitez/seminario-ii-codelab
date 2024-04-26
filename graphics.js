/**
 * Renderiza un diagrama de dispersión usando data.
 *
 * @param {[{ x: number, y: number }]} data
 * @param {{
 *      graphicName: string,
 *      labelX: string,
 *      labelY: string
 * }} options
 */

export function renderScatterPlot(data, options) {
    tfvis.render.scatterplot(
        { name: options.graphicName },
        { values: data },
        {
            xLabel: options.labelX,
            yLabel: options.labelY,
            height: 300
        }
    )

}
