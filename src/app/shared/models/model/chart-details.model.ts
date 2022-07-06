export interface IChartDetails {
    chartType?: string;
    barChartAxis?: string;
    donutChartArcSize?: number;
    chartHeight?: number;
    showLegend?: boolean;
}

export class ChartDetails implements IChartDetails {
    constructor(
        public chartType?: string,
        public barChartAxis?: string,
        public donutChartArcSize?: number,
        public chartHeight?: number,
        public showLegend?: boolean
    ) {}
}
