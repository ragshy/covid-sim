const plot = {
  labels: [],
  datasets: [
    {
      label: "Infectious",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
      data: [],
    },
    {
      label: "Recovered",
      backgroundColor: "rgb(132, 99, 255)",
      borderColor: "rgb(132, 99, 255)",
      data: [],
    },
    {
      label: "Deceased",
      backgroundColor: "rgb(220, 220, 220)",
      borderColor: "rgb(220, 220, 220)",
      data: [],
    },
  ],
};

function addData(chart, label, data0,data1,data2) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(data0);
  chart.data.datasets[1].data.push(data1);
  chart.data.datasets[2].data.push(data2);
  chart.update();
}
