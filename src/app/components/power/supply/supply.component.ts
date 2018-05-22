import { Component, OnInit } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';

@Component({
  selector: 'app-supply',
  templateUrl: './supply.component.html',
  styleUrls: ['./supply.component.css']
})
export class SupplyComponent implements OnInit {
  chartConfig = {
    "type": "doughnut2d",
    "width": "450",
    "height": "450"
  };
  chartDataSource = {
    "chart": {
      "numberSuffix": "kW",
      "paletteColors": "#ff0000,#00ff00,#0000ff,#ffff00",
      "bgColor": "#ffffff",
      "showBorder": "0",
      "use3DLighting": "1",
      "showShadow": "0",
      "enableSmartLabels": "0",
      "startingAngle": "90",
      "showLabels": "0",
      "showPercentValues": "0",
      "showLegend": "0",
      "legendShadow": "0",
      "legendBorderAlpha": "0",
      "defaultCenterLabel": "0.0 kW",
			"centerLabelBold": "1",
      "centerLabelFontSize": "20",
      "showTooltip": "0",
      "decimals": "0",
      "captionFontSize": "14",
      "subcaptionFontSize": "14",
      "subcaptionFontBold": "0"
    },
    "data": [{}]
  }

	constructor(private measurementsService: MeasurementsService) {
  }

  ngOnInit() {
		this.measurementsService.measurementSource$.subscribe(measurements => this.refreshSuppyData(measurements));
	}

	refreshSuppyData(measurements) {
		measurements.subscribe(measurement => {
			this.chartDataSource.data = [];
			let total = measurement.pload.value / 1000;
			let grid = measurement.pmeter.value / 1000;
			let solar = (measurement.ipv.value * measurement.vpv.value) / 1000;
			let battery = (measurement.ibattery.value * measurement.vbattery.value) / 1000;
			if (battery < 0 ) {
				battery = 0;
			}
			this.chartDataSource.chart.defaultCenterLabel = `${total} kW`
			this.chartDataSource.data.push({"label": "Grid", "value":grid});
			this.chartDataSource.data.push({"label": "Solar", "value":solar});
			this.chartDataSource.data.push({"label": "Battery", "value":battery});
		});
	}
}
