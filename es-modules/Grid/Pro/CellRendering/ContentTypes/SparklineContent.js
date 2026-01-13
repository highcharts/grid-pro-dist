/* *
 *
 *  Sparkline Cell Content class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import CellContentPro from '../CellContentPro.js';
import Globals from '../../../Core/Globals.js';
import U from '../../../../Core/Utilities.js';
const { defined, merge } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a sparkline type of cell content.
 */
class SparklineContent extends CellContentPro {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(cell, renderer, parentElement) {
        super(cell, renderer);
        this.onKeyDown = () => {
            this.cell.htmlElement.focus();
        };
        this.parentElement = parentElement ?? this.cell.htmlElement;
        this.add(this.parentElement);
    }
    /* *
     *
     *  Methods
     *
     * */
    add(parentElement = this.cell.htmlElement) {
        const H = SparklineContent.H;
        if (!H || !defined(this.cell.value)) {
            return;
        }
        this.parentElement = parentElement;
        this.chartContainer = document.createElement('div');
        this.parentElement.classList.add(Globals.getClassName('noPadding'));
        this.parentElement.appendChild(this.chartContainer);
        this.chart = H.Chart.chart(this.chartContainer, merge(SparklineContent.defaultChartOptions, this.getProcessedOptions()));
        this.chartContainer.addEventListener('click', this.onKeyDown);
    }
    update() {
        if (this.chart) {
            const chartOptions = this.getProcessedOptions();
            this.chart.update(chartOptions, true, false, chartOptions.chart?.animation);
        }
        else {
            this.destroy();
            this.add(this.parentElement);
        }
    }
    destroy() {
        this.chartContainer?.removeEventListener('keydown', this.onKeyDown);
        this.chart?.destroy();
        this.chartContainer?.remove();
        delete this.chart;
        delete this.chartContainer;
        this.parentElement.classList.remove(Globals.getClassName('noPadding'));
    }
    getProcessedOptions() {
        const renderer = this.renderer;
        const { chartOptions } = renderer.options;
        let options;
        if (typeof chartOptions === 'function') {
            options = chartOptions.call(this.cell, this.cell.value);
        }
        else {
            options = merge(chartOptions) || {};
        }
        let trimmedValue = ('' + this.cell.value).trim();
        if (!trimmedValue.startsWith('[') && !trimmedValue.startsWith('{')) {
            trimmedValue = `[${trimmedValue}]`;
        }
        if (!options.series) {
            options.series = [{
                    data: JSON.parse(trimmedValue)
                }];
        }
        return options;
    }
}
/**
 * The default chart options for the sparkline content.
 */
SparklineContent.defaultChartOptions = {
    chart: {
        height: 40,
        margin: [5, 8, 5, 8],
        backgroundColor: 'transparent',
        skipClone: true
    },
    accessibility: {
        enabled: false
    },
    tooltip: {
        enabled: false
    },
    title: {
        text: ''
    },
    credits: {
        enabled: false
    },
    xAxis: {
        visible: false
    },
    yAxis: {
        visible: false
    },
    legend: {
        enabled: false
    },
    plotOptions: {
        series: {
            borderWidth: 0,
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    enabled: false
                },
                inactive: {
                    enabled: false
                }
            },
            animation: false,
            dataLabels: {
                enabled: false
            }
        },
        pie: {
            slicedOffset: 0,
            borderRadius: 0
        }
    }
};
/* *
 *
 *  Default Export
 *
 * */
export default SparklineContent;
