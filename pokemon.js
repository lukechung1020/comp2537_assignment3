const PAGE_SIZE = 10;
let currentPage = 1;
let pokemon = [];
let pokemonTypes = [];
let numPokemon = 0;
let totalPokemon = 0;
let numPageBtn = 5;
let numPages = 0;

// Function that dynamically updates the type dropdowns (option is disabled if selected) IGNORES NONE
async function updateTypes(selectedValue, dropdownID) {
  let type1 = document.getElementById("type1").value;
  let type2 = document.getElementById("type2").value;

  var dropdowns = document.querySelectorAll("select");

  for (let i = 0; i < dropdowns.length; i++) {
    var dropdown = dropdowns[i];

    if (dropdown.id !== dropdownID) {
      var options = dropdown.options;
      for (let j = 1; j < options.length; j++) {
        if (options[j].value === selectedValue) {
          options[j].disabled = true;
        } else {
          options[j].disabled = false;
        }
      }
    }
  }

  let response1 = [];
  let response2 = [];

  if (type1 === "" && type2 === "") {
    location.reload();
  } else if (type1 === "" && type2 !== "") {
    response2 = await axios.get(`https://pokeapi.co/api/v2/type/${type2}`);
    pokemon = response2.data.pokemon.map((item) => item.pokemon);
  } else if (type1 !== "" && type2 === "") {
    response1 = await axios.get(`https://pokeapi.co/api/v2/type/${type1}`);
    pokemon = response1.data.pokemon.map((item) => item.pokemon);
  } else {
    response1 = await axios.get(`https://pokeapi.co/api/v2/type/${type1}`);
    response2 = await axios.get(`https://pokeapi.co/api/v2/type/${type2}`);
    let arr1 = response1.data.pokemon.map((item) => item.pokemon);
    let arr2 = response2.data.pokemon.map((item) => item.pokemon);
    pokemon = arr1.filter((pokemon1) =>
      arr2.some((pokemon2) => pokemon1.name === pokemon2.name)
    );
  }

  totalPokemon = pokemon.length;
  updateDisplay();

  paginate(currentPage, PAGE_SIZE, pokemon);
  numPages = Math.ceil(totalPokemon / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
}

// Updates the number of Pokemon shown and the total number of pokemon
function updateDisplay() {
  var current = numPokemon;
  var total = totalPokemon;

  var h1Display = document.getElementById("display");
  h1Display.textContent = "Showing " + current + " of " + total + " Pokemon";
}

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  var firstExists = false;
  var previousExists = false;
  var nextExists = false;
  var lastExists = false;

  const startPage = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
  const endPage = Math.min(numPages, currentPage + Math.floor(numPageBtn / 2));
  for (let i = startPage; i <= endPage; i++) {
    if (currentPage !== 1 && !previousExists) {
      $("#pagination").append(`
        <button class="btn btn-primary page ml1-1 numberedButtons" value="1">First</button>
        <button class="btn btn-primary page ml1-1 numberedButtons" value="${
          currentPage - 1
        }">Prev</button>
      `);
      previousExists = true;
    }

    let active = "";
    if (i === currentPage) {
      active = "active";
    }
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${active}" value="${i}">${i}</button>
    `);
  }
  if (currentPage !== numPages && !nextExists) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml1-1 numberedButtons" value="${
        currentPage + 1
      }">Next</button>
      <button class="btn btn-primary page ml1-1 numberedButtons" value="${numPages}">Last</button>
    `);
    nextExists = true;
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemon) => {
  selected_pokemon = pokemon.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  numPokemon = selected_pokemon.length;
  updateDisplay();

  $("#pokeCards").empty();
  selected_pokemon.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">
          More
        </button>
        </div>  
        `);
  });
};

const setup = async () => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );

  console.log(response);

  pokemon = response.data.results;

  // Get a list of all types
  const getTypes = await axios
    .get("https://pokeapi.co/api/v2/type/")
    .then((response) => {
      pokemonTypes = response.data.results;
    });

  let selectType1 = document.getElementById("type1");
  let selectType2 = document.getElementById("type2");

  // Add the option for none since Pokemon can be single typed
  const optionNone1 = document.createElement("option");
  optionNone1.selected = true;
  optionNone1.text = "none";
  optionNone1.value = "";

  selectType1.add(optionNone1);

  const optionNone2 = document.createElement("option");
  optionNone2.selected = true;
  optionNone2.text = "none";
  optionNone2.value = "";

  selectType2.add(optionNone2);

  // Populate the dropdowns with the pokemon types excluding shadow and unknown
  for (let i = 0; i < 18; i++) {
    const option1 = document.createElement("option");
    option1.text = pokemonTypes[i].name;
    option1.value = i + 1;

    selectType1.add(option1);

    const option2 = document.createElement("option");
    option2.text = pokemonTypes[i].name;
    option2.value = i + 1;

    selectType2.add(option2);
  }

  totalPokemon = pokemon.length;
  updateDisplay();

  paginate(currentPage, PAGE_SIZE, pokemon);
  numPages = Math.ceil(totalPokemon / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types
            .map(
              (type) =>
                `<li>${type.charAt(0).toUpperCase() + type.slice(1)}</li>`
            )
            .join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  // add event listener to pagination buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemon);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);
