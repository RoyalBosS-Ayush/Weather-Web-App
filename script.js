let weather = {
	apiKey: "225363b5844950ebd6ab54338bf2446a",
	fetchWeather: function (city, lat, lon) {
		fetch(
			city ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
				: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
		).then((response) => {
			if (!response.ok) {
				alert("No weather found.");
				throw new Error("No weather found.");
			}
			return response.json();
		}).then((data) => { this.displayWeather(data); forcastWeather(lat ? undefined : city, lat, lon) });
	},
	displayWeather: function (data) {
		console.log("sdf", data);
		const { name } = data;
		const { icon, description } = data.weather[0];
		const { temp, humidity, feels_like, temp_max, temp_min } = data.main;
		const { speed } = data.wind;
		let main = data.weather[0].main;

		document.querySelector(".location").innerText = data.name;
		document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
		document.querySelector(".weather-description").innerText = description;
		document.querySelector(".feels_like").innerText = `Feels Like: ${feels_like}°C`;
		document.querySelector(".temp_max").innerText = `Max Temp: ${temp_max}°C`;
		document.querySelector(".temp_min").innerText = `Min Temp: ${temp_min}°C`;
		document.querySelector(".pressure").innerText = `Pressure: ${data.main.pressure}`;
		document.querySelector(".temperature").innerText = temp + "°C";
		document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
		document.querySelector(".wind").innerText = `Wind Speed: ${speed} km/h`;
	}
}

function setIcon(index, weather) {
	document.querySelector(`.ic${index}`).src = `https://cdn.aerisapi.com/wxicons/v2/${weather}`;
}

function setDay(time) {
	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var d = new Date(time.slice(0, 10));
	return days[d.getDay()];
}

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '76e2f3a6e5msha9d6055dd5051b9p1fee85jsn7d2265ba6bcb',
		'X-RapidAPI-Host': 'aerisweather1.p.rapidapi.com'
	}
};

let chart;

function forcastWeather(city, lat, lon) {
	let url = city ? `https://aerisweather1.p.rapidapi.com/forecasts/${city},in` : `https://aerisweather1.p.rapidapi.com/forecasts/${lat},${lon}`;

	fetch(url, options)
		.then(response => response.json())
		.then(response => {
			let data = []
			for (var i = 0; i < 7; i++) {
				const day = setDay(response.response[0].periods[i].dateTimeISO)
				setIcon(i, response.response[0].periods[0].icon);

				dayData = {
					day: day,
					avgFeelslikeC: response.response[0].periods[i].avgFeelslikeC,
					pressureIN: response.response[0].periods[i].pressureIN,
					humidity: response.response[0].periods[i].humidity,
					windSpeedKPH: response.response[0].periods[i].windSpeedKPH,
				}

				document.querySelector(`.d${i}`).innerText = day;
				document.querySelector(`.temp${i}`).innerText = dayData.avgFeelslikeC + " °C";
				document.querySelector(`.pres${i}`).innerText = dayData.pressureIN;
				document.querySelector(`.hum${i}`).innerText = dayData.humidity;
				document.querySelector(`.wind${i}`).innerText = dayData.windSpeedKPH + " Km/h";

				data.push(dayData)
			}
			drawCanvas(data)
		})
		.catch(err => console.error(err));
}

function drawCanvas(data) {
	if (chart)
		chart.destroy();
	var ctx = document.getElementById('myChart').getContext('2d');

	var TemperatureGradient = ctx.createLinearGradient(0, 0, 0, 400);
	TemperatureGradient.addColorStop(0, 'rgba(255, 99, 132, 1)');
	TemperatureGradient.addColorStop(1, 'rgba(255, 99, 132, 0)');
	var HumidityGradient = ctx.createLinearGradient(0, 0, 0, 400);
	HumidityGradient.addColorStop(0, 'rgba(99, 132, 255, 1)');
	HumidityGradient.addColorStop(1, 'rgba(99, 132, 255, 0)');
	var WindGradient = ctx.createLinearGradient(0, 0, 0, 400);
	WindGradient.addColorStop(0, '#0f01');
	WindGradient.addColorStop(1, '#0f02');


	chart = new Chart(ctx, {
		type: 'line',
		borderWidth: 0,
		data: {
			labels: data.map(item => item.day),
			datasets: [{
				label: 'Temperature',
				data: data.map(item => item.avgFeelslikeC),
				backgroundColor: TemperatureGradient,
				tension: 0.4,
				fill: true,
				borderWidth: 0,
			}, {
				label: 'Humidity',
				data: data.map(item => item.humidity),
				backgroundColor: HumidityGradient,
				tension: 0.3,
				fill: true,
				borderWidth: 0,
				// }, {
				// 	label: 'WindSpeed',
				// 	data: data.map(item => item.windSpeedKPH),
				// 	backgroundColor: WindGradient,
				// 	tension: 0.4,
				// 	fill: true,
				// 	borderWidth: 0,
			},]
		},
		options: {
			scales: {
				x: {
					grid: {
						color: null,
					},
				},
				y: {
					grid: {
						color: null,
					},
					min: 0
				}
			}
		}
	});
}

function loadWeather() {
	const city = document.querySelector("#search-bar input").value.trim() || "Delhi";
	const str = city;
	const str2 = str.charAt(0).toUpperCase() + str.slice(1);
	document.querySelector(".location").innerText = str2;
	weather.fetchWeather(city);
}

function showPosition(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	weather.fetchWeather(undefined, latitude, longitude);
}

loadWeather();
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(showPosition);
} else {
	alert("Geolocation is not supported by this browser.");
}

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();
	loadWeather();
})