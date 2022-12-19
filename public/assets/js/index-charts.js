'use strict';

/* Chart.js docs: https://www.chartjs.org/ */

window.chartColors = {
	green: '#75c181',
	gray: '#a9b5c9',
	text: '#252930',
	border: '#e7e9ed'
};

/* Random number generator for demo purpose */
var randomDataPoint = function () { return Math.round(Math.random() * 10000) };


//Chart.js Line Chart Example 

var lineChartConfig = {
	type: 'line',

	data: {
		labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],

		datasets: [{
			label: 'Current week',
			fill: false,
			backgroundColor: window.chartColors.green,
			borderColor: window.chartColors.green,
			data: [],
		}, {
			label: 'Previous week',
			borderDash: [3, 5],
			backgroundColor: window.chartColors.gray,
			borderColor: window.chartColors.gray,
			data: [],
			fill: false,
		}]
	},
	options: {
		responsive: true,
		aspectRatio: 1.5,

		legend: {
			display: true,
			position: 'bottom',
			align: 'end',
		},

		title: {
			display: true,
			text: 'Sales',

		},
		tooltips: {
			mode: 'index',
			intersect: false,
			titleMarginBottom: 10,
			bodySpacing: 10,
			xPadding: 16,
			yPadding: 16,
			borderColor: window.chartColors.border,
			borderWidth: 1,
			backgroundColor: '#fff',
			bodyFontColor: window.chartColors.text,
			titleFontColor: window.chartColors.text,

			callbacks: {
				//Ref: https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
				label: function (tooltipItem, data) {
					if (parseInt(tooltipItem.value) >= 1000) {
						return "₹" + tooltipItem.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					} else {
						return '₹' + tooltipItem.value;
					}
				}
			},

		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.border,
				},
				scaleLabel: {
					display: false,

				}
			}],
			yAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.border,
				},
				scaleLabel: {
					display: false,
				},
				ticks: {
					beginAtZero: true,
					userCallback: function (value, index, values) {
						return '₹' + value.toLocaleString();   //Ref: https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
					}
				},
			}]
		}
	}
};



// Chart.js Bar Chart Example 

var barChartConfig = {
	type: 'bar',

	data: {
		labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		datasets: [{
			label: 'Orders',
			backgroundColor: window.chartColors.green,
			borderColor: window.chartColors.green,
			borderWidth: 1,
			maxBarThickness: 16,

			data: []
		}]
	},
	options: {
		responsive: true,
		aspectRatio: 1.5,
		legend: {
			position: 'bottom',
			align: 'end',
		},
		title: {
			display: true,
			text: 'Orders'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
			titleMarginBottom: 10,
			bodySpacing: 10,
			xPadding: 16,
			yPadding: 16,
			borderColor: window.chartColors.border,
			borderWidth: 1,
			backgroundColor: '#fff',
			bodyFontColor: window.chartColors.text,
			titleFontColor: window.chartColors.text,

		},
		scales: {
			xAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.border,
				},

			}],
			yAxes: [{
				display: true,
				gridLines: {
					drawBorder: false,
					color: window.chartColors.borders,
				},


			}]
		}

	}
}



// Generate charts on load
window.addEventListener('load', function () {
	getDetails(30)
});

const salesChange = () => {
	let val = document.getElementById('salesChange').value
	var lineChart = document.getElementById('canvas-linechart').getContext('2d');
	lineChart.clearRect(0, 0, 500, 500);
	//getDetails(val)
}

const getDetails = (val) => {
	var lineChart = document.getElementById('canvas-linechart').getContext('2d');
	axios.get('/admin/getDetails', { params: { value: val } }).then((e) => {
		if (val == 30) {
			lineChartConfig.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
			barChartConfig.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
			document.getElementById('salesIdd').innerHTML = e.data.saleFull[0].totalPrice
			document.getElementById('ordersId').innerHTML = e.data.saleFull[0].count
			if (e.data.perfomance) document.getElementById('perfomanceId').innerHTML = e.data.perfomance
			else document.getElementById('perfomanceId').innerHTML = ''
			let data = []
			let linedata = []
			let linePrevdata = []
			for (let i = 0; i < e.data.sales.length; i++) {
				data.push(e.data.sales[i].count)
				linedata.push(e.data.sales[i].totalPrice)
				linePrevdata.push(e.data.prevsales[i].totalPrice)
			}
			barChartConfig.data.datasets[0].data = data
			lineChartConfig.data.datasets[0].data = linedata
			lineChartConfig.data.datasets[1].data = linePrevdata
			var barChart = document.getElementById('canvas-barchart').getContext('2d');
			window.myBar = new Chart(barChart, barChartConfig);
			window.myLine = new Chart(lineChart, lineChartConfig);
		}
		if (val == 365) {
			lineChartConfig.data.labels = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			barChartConfig.data.labels = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			document.getElementById('salesIdd').innerHTML = e.data.saleFull[0].totalPrice
			document.getElementById('ordersId').innerHTML = e.data.saleFull[0].count
			if (e.data.perfomance) document.getElementById('perfomanceId').innerHTML = e.data.perfomance
			else document.getElementById('perfomanceId').innerHTML = ''
			let data = []
			let linedata = []
			let linePrevdata = []
			for (let i = 0; i < e.data.sales.length; i++) {
				data.push(e.data.sales[i].count)
				linedata.push(e.data.sales[i].totalPrice)
				linePrevdata.push(e.data.prevsales[i].totalPrice)
			}
			barChartConfig.data.datasets[0].data = data
			lineChartConfig.data.datasets[0].data = linedata
			lineChartConfig.data.datasets[1].data = linePrevdata
			var barChart = document.getElementById('canvas-barchart').getContext('2d');
			window.myBar = new Chart(barChart, barChartConfig);
			window.myLine = new Chart(lineChart, lineChartConfig);
		}

	})
}