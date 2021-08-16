import { getSummary } from "../services/api.js";

window.addEventListener("load", () => {
  renderSummary();
});

async function renderSummary() {
  let data = await getSummary();
  document.getElementById("confirmed").innerText =
    data.Global.TotalConfirmed.toLocaleString("pt");
  document.getElementById("death").innerText = document.getElementById(
    "recovered"
  ).innerText = data.Global.TotalDeaths.toLocaleString("pt");
  data.Global.TotalRecovered.toLocaleString("pt");

  const orderedCountriesTotalDeaths = orderCountriesTop10(data.Countries);
  getPizzaChart(data);

  getBarrasChart(orderedCountriesTotalDeaths);
}

function orderCountriesTop10(data) {
  return data
    .sort((a, b) => b.TotalDeaths - a.TotalDeaths)
    .map((country) => {
      return {
        Country: country.Country,
        TotalDeaths: country.TotalDeaths,
      };
    })
    .slice(0, 10);
}

function getPizzaChart(data) {
  let pizza = new Chart(document.getElementById("pizza"), {
    type: "pie",
    data: {
      labels: ["Novas Confirmados", "Novas Mortes", "Novos Recuperados"],
      datasets: [
        {
          data: [
            data.Global.NewConfirmed,
            data.Global.NewDeaths,
            data.Global.NewRecovered,
          ],
          backgroundColor: ["#ffb8b8", "#fff200", "#18dcff"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Distribuição de Novos Casos",
        },
      },
    },
  });
}

function getBarrasChart(orderedCountriesTotalDeaths) {
  let barras = new Chart(document.getElementById("barras"), {
    type: "bar",
    data: {
      labels: orderedCountriesTotalDeaths.map((country) => country.Country),
      datasets: [
        {
          label: "Total de Mortes por País",
          data: orderedCountriesTotalDeaths.map(
            (country) => country.TotalDeaths
          ),
          backgroundColor: "#cd84f1",
        },
      ],
    },
    options: {
      reponsive: true,
      plugins: {
        title: {
          display: true,
          text: "Total de Mortes por País - Top 10",
        },
      },
    },
  });
}
