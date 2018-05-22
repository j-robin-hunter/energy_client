import { Component, OnInit } from '@angular/core';
import { MeasurementsService } from '../../../services/measurements.service';

@Component({
  selector: 'app-consumption',
  templateUrl: './consumption.component.html',
  styleUrls: ['./consumption.component.css']
})
export class ConsumptionComponent implements OnInit {
  chartConfig = {
    "type": "bar2d",
    "width": "450",
    "height": "450"
  };
  chartDataSource = {
    "chart": {
      "numberSuffix": "kW",
      "bgColor": "#ffffff",
      "showBorder": "0",
      "showCanvasBorder": "0",
      "enableSmartLabels": "0",
      "useRoundEdges": "0",
      "showPlotBorder": "0",
      "showLabels": "1",
      "showLegend": "1",
      "legendShadow": "0",
      "legendBorderAlpha": "0",
      "showTooltip": "0",
      "decimals": "2",
      "placeValuesInside": "1",
      "showAxisLines": "1",
      "axisLineAlpha": "5",
      "showAlternateVGridColor": "0",
      "paletteColors": "#009688",
      "usePlotGradientColor": "0",
      "valueFontColor": "#ffffff",
        "divLineAlpha": "10"
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
			this.chartDataSource.data.push({"label": "Washing", "value":measurement.washing_machines.value / 1000});
      this.chartDataSource.data.push({"label": "Water Heater", "value":measurement.water_heater.value / 1000});
      this.chartDataSource.data.push({"label": "Kitchen Island", "value":measurement.kitchen_island.value / 1000});
      this.chartDataSource.data.push({"label": "Ovens", "value":measurement.ovens.value / 1000});
      this.chartDataSource.data.push({"label": "Upstairs Power", "value":measurement.upsairs_power.value / 1000});
      this.chartDataSource.data.push({"label": "Kichen Power", "value":measurement.kitchen_power.value / 1000});
      this.chartDataSource.data.push({"label": "Over Garage Power", "value":measurement.over_garage_power.value / 1000});
      this.chartDataSource.data.push({"label": "Downstairs Power", "value":measurement.downstairs_power.value / 1000});
      this.chartDataSource.data.push({"label": "Living Room Power & DMX", "value":measurement.living_room_and_dmx.value / 1000});
      this.chartDataSource.data.push({"label": "Lighting", "value":measurement.lighting.value / 1000});
      this.chartDataSource.data.push({"label": "Evolution", "value":measurement.evolution.value / 1000});

		});
	}
}
