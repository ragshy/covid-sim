population = 500;
numberOfBuildings = 5;
person_size = 3;
spreadRange = 30;
transmissionRate = 1.01;

let persons = [];
let buildings = [];
let data;

function preload(){
  const api_url = 'https://api.corona-zahlen.org/germany';
  data = loadJSON(api_url);
}

function setup() {
  createCanvas(500, 500);
  console.log(data);
  // make population
  for (let i = 0; i < population-1; i++) {
    persons[i] = new Person(
      i,
      random(width),
      random(height),
      random(-2, 2),
      random(-2, 2),
      "unexposed",
      person_size,
      spreadRange
    );
  }
  persons[population-1] = new Person(
      population,
      random(width),
      random(height),
      random(-2, 2),
      random(-2, 2),
      "infected",
      person_size,
      spreadRange
    );
  for (let i = 0; i < numberOfBuildings; i++) {
    buildings[i] = new Building();
  }
}

function draw() {
  background(255);

  for (let i = 0; i < population; i++) {
    persons[i].show();
    persons[i].move();
  }

  for (let i = 0; i < numberOfBuildings; i++) {
    buildings[i].show();
  }
  
  // check each person colliding with each other person
  for (let i = 0; i < population; i++) {
    for (let j = 0; j < population; j++) {
      if (j != i && isCollided(persons[i], persons[j])) {
        // if collision infect with some rate
        if (random() < transmissionRate-1) {
          if (persons[i].stat=="infected" || persons[j].stat=="infected"){
          persons[i].stat = "infected";
          persons[j].stat = "infected";}
        }
      }
    }
  }
}

function isCollided(a, b) {
  return !(
    a.y + a.spread < b.y ||
    a.y > b.y + b.spread ||
    a.x + a.spread < b.x ||
    a.x > b.x + b.spread
  );
}
