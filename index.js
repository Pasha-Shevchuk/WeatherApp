const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
// const submitBtn = document.querySelector("button[type=submit]");
const card = document.querySelector(".card");
const apiKey = "7f8e3bbe4aa7f8c1e010f37ce51235ab";
let countriesObj;

window.onload = async e =>{
    countriesObj = await getCountry("countries.json");
}


weatherForm.addEventListener("submit",async event => {

    event.preventDefault(); // to prevent refresh

    const city = cityInput.value;
    
    if(city){
        try{
            const weatherData = await getWetherData(city);
            displayWeatherInfo(weatherData);

        } catch(error) {
            console.error(error);
            displayError(error);
        }
    } else {
         displayError("Please enter a city");
    }
     

});


async function getWetherData(city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    const response = await fetch(apiUrl);

    if(!response.ok){
        throw new Error("Could not fetch weather data");
    }

    return await response.json();
}

async function displayWeatherInfo(data){
    console.log(data);

    const{name:city,
        main:{temp,humidity},
        weather:[{description,id}],
        sys:{country}
    } = data;

    card.textContent = "";
    card.style.display = "grid";

    const cityDisplay = document.createElement("h1");
    const countryDisplay = document.createElement("p");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    countryDisplay.textContent = getCountryNameByCode(countriesObj,country);
    tempDisplay.textContent = `${temp}°K`; 
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeather(id).emoji;

    cityDisplay.classList.add("cityDisplay");
    countryDisplay.classList.add("countryDisplay");
    tempDisplay.classList.add("cityDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(countryDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);

    
    // card appearence
    const timezone = data.timezone / 3600;
    const date = (new Date().getUTCHours() + timezone) %24;

    const dateNow = new Date();
    const localDate = new Date(dateNow.getTime() + timezone * 60 * 60 * 1000);
    

    let timeOfDay = "";
    switch (true) {
      case date < 6:
        timeOfDay = "Night";
        break;
      case date < 13:
        timeOfDay = "Morning";
        break;
      case date < 19:
        timeOfDay = "Afternoon";
        break;
      case date < 25:
        timeOfDay = "Evening";
        break;
    }

    // just to display
    const dateDisplay = document.createElement("p");
    dateDisplay.textContent = localDate.toUTCString();
    dateDisplay.classList.add("dateDisplay");
    card.appendChild(dateDisplay);

    let weatherName = getWeather(id).name;
    let [gradient, color] = await getWeatherGradient("data.json", weatherName, timeOfDay);



    card.style.backgroundImage = gradient;
    const cardElements = document.querySelectorAll(".card > p:not(.weatherEmoji), h1");

    cardElements.forEach(element => {
        element.style.color = color;
    })



   

}



function getCountryNameByCode(countries, code) {
    const country = countries.find(country => country.code === code);
    return country ? country.name : "Country not found";
}

async function getWeatherGradient(fileJson, weather, timeOfDay){
    try {
        const jsonDataObj = await getDataJson(fileJson);
        let gradient = jsonDataObj["styles"][weather][timeOfDay]["gradient"];
        let color = jsonDataObj["styles"][weather][timeOfDay]["textColor"];
        return [gradient, color];
    } catch(error){
        console.error(error);
        return null;
    }
}


async function getCountry(file){
    try {
        let data = await getDataJson(file);
        return data;
    } catch( error){
        console.error(error);
        return null;
    }
}


async function getDataJson(file){
    const response = await fetch(file);
    
    if(!response.ok){
        throw new Error("Cannot fetch data");
    }

    const data = await response.json();
    return data;
}

function getWeather(weatherId){
    switch(true){
        case weatherId >= 200 && weatherId < 300:
            return {name: "thunderstorm", emoji: "⛈️"};

        case weatherId >= 300 && weatherId < 400:
            return {name: "fog", emoji:'🌫️'};
            
        case weatherId >= 500 && weatherId < 600:
            return {name: "rain", emoji:"🌧️"};
            
        case weatherId >= 600 && weatherId < 700:
            return {name: "snow", emoji:"❄️"};
            
        case weatherId >= 700 && weatherId < 800:
            return {name: "atmosphere", emoji:"🫧"};
            
        case weatherId == 800:
            return {name: "clear", emoji:"☀️"};
            
        case weatherId > 800:
            return {name: "clouds", emoji:"☁️"};

        default:
            return "❔";

    }
}

function displayError(error){
    const errorDispaly = document.createElement("p");
    errorDispaly.textContent = error;
    errorDispaly.classList.add("errorDisplay");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDispaly);
}

