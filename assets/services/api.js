const apiCovid = axios.create({
  baseURL: "https://api.covid19api.com/",
});

async function getSummary() {
  let { data } = await apiCovid.get("summary");
  return data;
}

async function getCountries() {
  let { data } = await apiCovid.get("countries");
  return data;
}

async function getCountryAllStatus(country, previousDate, endDate) {
  let { data } = await apiCovid.get(
    `country/${country}?from=${myDateFormat(
      previousDate
    )}T00:00:00Z&to=${myDateFormat(endDate)}T23:59:59Z`
  );
  return data;
}

function myDateFormat(d) {
  return d.toISOString().split("T")[0];
}

export { getSummary, getCountries, getCountryAllStatus };
