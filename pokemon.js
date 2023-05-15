let pokemon = [];

const setup = async () => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemon = response.data.results;
  pokemon.forEach(async (pokemon) => {
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
