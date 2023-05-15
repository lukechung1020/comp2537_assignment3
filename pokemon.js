const PAGE_SIZE = 10;
let currentPage = 1;
let pokemon = [];
let numPokemon = 0;
let totalPokemon = 0;
let numPageBtn = 5;
let numPages = 0;

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
        <button class="btn btn-primary page ml1-1 numberedButtons" value="${currentPage - 1}">Prev</button>
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
      <button class="btn btn-primary page ml1-1 numberedButtons" value="${currentPage + 1}">Next</button>
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
  pokemon = response.data.results;

  totalPokemon = pokemon.length;
  updateDisplay();

  paginate(currentPage, PAGE_SIZE, pokemon);
  numPages = Math.ceil(pokemon.length / PAGE_SIZE);
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
