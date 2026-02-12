// ==================================================
// dashboard.js
// Crop Yield Visualization Logic
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------
    //  LOAD & VALIDATE PREDICTION DATA
    // --------------------------------------------------
    const dataElement = document.getElementById("prediction-data");
    if (!dataElement) return;

    const predictionHistory = JSON.parse(dataElement.textContent || "[]");
    if (predictionHistory.length === 0) return;

    // --------------------------------------------------
    //  GLOBAL CONFIG
    // --------------------------------------------------
    const baseAnimation = {
        duration: 1200,
        easing: "easeOutQuart"
    };

    let filteredData = [...predictionHistory];

    // --------------------------------------------------
    //  FILTER DROPDOWN SETUP
    // --------------------------------------------------
    const cropFilter = document.getElementById("cropFilter");

    if (cropFilter) {
        const uniqueCrops = [...new Set(predictionHistory.map(r => r.crop))];
        uniqueCrops.forEach(crop => {
            const option = document.createElement("option");
            option.value = crop;
            option.textContent = crop;
            cropFilter.appendChild(option);
        });
    }

    function applyFilter(crop) {
        filteredData = crop === "All"
            ? [...predictionHistory]
            : predictionHistory.filter(r => r.crop === crop);

        updateCharts();
    }

    // --------------------------------------------------
    //  CHART INSTANCES (GLOBAL REFERENCES)
    // --------------------------------------------------
    let yieldChart, rainfallScatter, cropBar, fertilizerPie;

    // --------------------------------------------------
    // MAIN YIELD + WEATHER CHART
    // --------------------------------------------------
    function createYieldChart() {
        const ctx = document.getElementById("yieldChart").getContext("2d");

        yieldChart = new Chart(ctx, {
            type: "bar",
            data: buildYieldChartData(),
            options: buildYieldChartOptions()
        });
    }

    function buildYieldChartData() {
        return {
            labels: filteredData.map((r, i) => `${r.crop} ${i + 1}`),
            datasets: [
                {
                    type: "line",
                    label: "Predicted Yield (tons/ha)",
                    data: filteredData.map(r => r.predicted_yield),
                    borderColor: "#6bff0256",
                    backgroundColor: "rgba(9, 135, 193, 0.28)",
                    tension: 0.35,
                    fill: true,
                    yAxisID: "yYield",
                    pointRadius: 5
                },
                {
                    type: "bar",
                    label: "Rainfall (mm)",
                    data: filteredData.map(r => r.rainfall),
                    backgroundColor: "rgb(153, 0, 255)",
                    yAxisID: "yWeather"
                },
                {
                    type: "bar",
                    label: "Temperature (°C)",
                    data: filteredData.map(r => r.temperature),
                    backgroundColor: "rgb(255, 166, 0)",
                    yAxisID: "yWeather"
                }
            ]
        };
    }

    function buildYieldChartOptions() {
        return {
            responsive: true,
            animation: baseAnimation,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        afterBody: items => {
                            const r = filteredData[items[0].dataIndex];
                            return `Fertilizer: ${r.fertilizer_used ? "✅" : "❌"} | Irrigation: ${r.irrigation_used ? "💧" : "❌"}`;
                        }
                    }
                }
            },
            scales: {
                yYield: {
                    position: "left",
                    beginAtZero: true,
                    title: { display: true, text: "Yield (tons/ha)" }
                },
                yWeather: {
                    position: "right",
                    beginAtZero: true,
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "Rainfall / Temperature" }
                }
            }
        };
    }

    // --------------------------------------------------
    // SCATTER: RAINFALL VS YIELD
    // --------------------------------------------------
    function createScatterChart() {
        rainfallScatter = new Chart(
            document.getElementById("rainfallScatter"),
            {
                type: "scatter",
                data: {
                    datasets: [{
                        label: "Rainfall vs Yield",
                        data: filteredData.map(r => ({
                            x: r.rainfall,
                            y: r.predicted_yield
                        })),
                        backgroundColor: "rgb(0, 51, 255)"
                    }]
                },
                options: {
                    responsive: true,
                    animation: baseAnimation,
                    scales: {
                        x: { title: { display: true, text: "Rainfall (mm)" } },
                        y: { title: { display: true, text: "Yield (tons/ha)" } }
                    }
                }
            }
        );
    }

    // --------------------------------------------------
    //  BAR: AVERAGE YIELD PER CROP
    // --------------------------------------------------
    function createCropBarChart() {
    const grouped = {};
    filteredData.forEach(r => {
        grouped[r.crop] ??= [];
        grouped[r.crop].push(r.predicted_yield);
    });

    const labels = Object.keys(grouped);

    // Assign a color per crop
    const cropColors = {
        "Maize": "#ffd900",      // Yellow
        "Wheat": "#ff6a00",      // Chocolate
        "Rice": "#fe0000",  // red
        "Soybean": "#00fe08",   // Green
        "Cotton": "#0783ff"      // Sky Blue
    };

    // Map colors to each crop in order of labels
    const colors = labels.map(crop => cropColors[crop] || "#888888");

    cropBar = new Chart(
        document.getElementById("cropBar"),
        {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Avg Yield (tons/ha)",
                    data: Object.values(grouped).map(arr => arr.reduce((a,b) => a+b, 0)/arr.length),
                    backgroundColor: colors  // <-- only change is here
                }]
            },
            options: {
                responsive: true,
                animation: baseAnimation,
                plugins: { legend: { display: false } }
            }
        }
    );
}


    // --------------------------------------------------
    //  DOUGHNUT: FERTILIZER USAGE
    // --------------------------------------------------
    function createFertilizerPie() {
        fertilizerPie = new Chart(
            document.getElementById("fertilizerPie"),
            {
                type: "doughnut",
                data: {
                    labels: ["Used", "Not Used"],
                    datasets: [{
                        data: [
                            filteredData.filter(r => r.fertilizer_used).length,
                            filteredData.filter(r => !r.fertilizer_used).length
                        ],
                        backgroundColor: ["#ff9c07", "#fe0048"]
                    }]
                },
                options: { responsive: true, animation: baseAnimation }
            }
        );
    }

    
        

    // --------------------------------------------------
    // UPDATE ALL CHARTS AFTER FILTER
    // --------------------------------------------------
    function updateCharts() {
        yieldChart.data = buildYieldChartData();
        yieldChart.update();

        rainfallScatter.data.datasets[0].data =
            filteredData.map(r => ({ x: r.rainfall, y: r.predicted_yield }));
        rainfallScatter.update();

        cropBar.destroy();
        fertilizerPie.destroy();
        createCropBarChart();
        createFertilizerPie();
        
    }

    // --------------------------------------------------
    //  INITIALIZE EVERYTHING
    // --------------------------------------------------
    createYieldChart();
    createScatterChart();
    createCropBarChart();
    createFertilizerPie();
    

    if (cropFilter) {
        cropFilter.addEventListener("change", e => applyFilter(e.target.value));
    }
});
