import {
  getSummary,
  getCountries,
  getCountryAllStatus,
} from "../services/api.js";

const startDateInput = document.getElementById("date_start");
const endDateInput = document.getElementById("date_end");
const comboCountries = document.getElementById("cmbCountry");
const comboData = document.getElementById("cmbData");
const filtroButton = document.getElementById("filtro");
let linhas = document.getElementById("linhas");
let linhasContainer = document.getElementById("linhasContainer");
let startUnformattedDate = new Date();
let endUnformattedDate = new Date();
let startDate = startUnformattedDate.toISOString().split("T")[0];
let endDate = endUnformattedDate.toISOString().split("T")[0];
let selectedCountry = "brazil";
let selectedData = "Deaths";
let countries = [];
let countriesByAllStatus = [];
let summary = {};

(() => {
  (async () => {
    countries = await getCountries();
    countriesByAllStatus = await getCountryAllStatus(
      selectedCountry,
      getFourDaysBefore(startDate),
      getPreviousDate(endDate)
    );
    summary = await getSummary();
    renderDefault(countries, countriesByAllStatus);
  })();

  startDateInput.addEventListener("change", () => {
    startDate = startDateInput.value;
  });

  endDateInput.addEventListener("change", () => {
    endDate = endDateInput.value;
  });

  comboCountries.addEventListener("click", () => {
    selectedCountry = comboCountries.value;
  });

  comboData.addEventListener("click", async () => {
    selectedData = comboData.value;
  });

  filtroButton.addEventListener("click", async () => {
    const endDateDate = new Date(endDate);
    countriesByAllStatus = await getCountryAllStatus(
      selectedCountry,
      getPreviousDate(startDate),
      endDateDate
    );
    handleFilter(countriesByAllStatus, summary, selectedData);
  });
})();

async function renderDefault(countries, countriesByAllStatus) {
  let orderedCountries = countries.sort((a, b) => {
    return a.Country < b.Country ? -1 : a.Country > b.nome ? 1 : 0;
  });
  orderedCountries.forEach((country) => {
    comboCountries.options[comboCountries.options.length] = new Option(
      country.Country,
      country.Slug
    );
  });
  comboCountries.value = selectedCountry;
  console.log(countriesByAllStatus);
  getLineChart(countriesByAllStatus, selectedData);
  getMoreCountryInfo(summary);
}

function getPreviousDate(stardate) {
  const previousDate = new Date(stardate);
  previousDate.setDate(previousDate.getDate() - 1);
  return previousDate;
}

function getFourDaysBefore(stardate) {
  const previousDate = new Date(stardate);
  previousDate.setDate(previousDate.getDate() - 4);
  return previousDate;
}

function getDeltaForChart(countriesByAllStatus, info) {
  let yDaily = [];

  for (let i = 1; i < countriesByAllStatus.length; i++) {
    yDaily = [
      ...yDaily,
      countriesByAllStatus[i][info] - countriesByAllStatus[i - 1][info],
    ];
  }
  return yDaily;
}

function getChartAvg(countriesByAllStatus) {
  let avgCountries = [];
  let acc = 0;
  let avg = 0;
  let delta = getDeltaForChart(countriesByAllStatus);
  for (let i = 0; i < delta.length; i++) {
    acc += delta[i];
  }

  avg = acc / delta.length;
  for (let i = 0; i < delta.length; i++) {
    avgCountries = [...avgCountries, avg];
  }
  return avgCountries;
}

function getLineChart(countriesByAllStatus, info) {
  if (linhas) {
    linhasContainer.innerHTML = "";
    linhasContainer.innerHTML =
      '<canvas id="linhas" width="300" height="100"></canvas>';
  }
  let yDaily = getDeltaForChart(countriesByAllStatus, info);
  let avgCountries = getChartAvg(countriesByAllStatus);
  linhas = new Chart(document.getElementById("linhas"), {
    type: "line",
    data: {
      labels: countriesByAllStatus
        .map((filteredCountry) => filteredCountry.Date)
        .slice(1),
      datasets: [
        {
          data: avgCountries,
          label:
            info == "Confirmed"
              ? "Média de Confirmados"
              : info == "Deaths"
              ? "Média de Mortes"
              : "Média de Recuperados",
          borderColor: "rgb(60,186,159)",
          backgroundColor: "rgb(60,186,159,0.1)",
        },
        {
          data: yDaily,

          label:
            info == "Confirmed"
              ? "Número de Confirmados"
              : info == "Deaths"
              ? "Número de Mortes"
              : "Número de Recuperados",
          borderColor: "rgb(255,140,13)",
          backgroundColor: "rgb(255,140,13, 0.1)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "left", //top, bottom, left, rigth
        },
        title: {
          display: true,
          text: "Curva de Covid",
        },
        layout: {
          padding: {
            left: 100,
            right: 100,
            top: 50,
            bottom: 10,
          },
        },
      },
    },
  });
}

async function handleFilter(countriesByAllStatus, summary, info) {
  getMoreCountryInfo(summary);
  getLineChart(countriesByAllStatus, info);
}

function getMoreCountryInfo(summary) {
  if (startDate !== "" && endDate !== "" && selectedCountry !== "") {
    let currentCountry = summary.Countries.find(
      (findCountry) => selectedCountry == findCountry.Slug
    );
    document.getElementById("kpiconfirmed").innerText =
      currentCountry.TotalConfirmed.toLocaleString("pt");
    document.getElementById("kpideaths").innerText =
      currentCountry.TotalDeaths.toLocaleString("pt");
    document.getElementById("kpirecovered").innerText =
      currentCountry.TotalRecovered.toLocaleString("pt");
  }
}
