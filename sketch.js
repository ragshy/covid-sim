person_size = 15;

let persons = [];
let data;

let day = 0;
let model;
time_speed = 3; // 3 seconds = 1 day

function preload() {
  // Get RKI data from API
  const api_url = "https://api.corona-zahlen.org/germany";
  data = loadJSON(api_url);
  const api_url_vax = "https://api.corona-zahlen.org/vaccinations";
  data_vax = loadJSON(api_url_vax);

  lockdown_img = loadImage("assets/lockdown.png");
  bed_img = loadImage("assets/bed.png");
  event_img = loadImage("assets/event.png");
}

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('sketch-container');
  // for plot
  options = {
    responsive: true,
    maintainAspectRatio: false,
  };
  config = {
    type: "line",
    data: plot,
    options: options,
  };
  chart = new Chart(document.getElementById("plot"), config);

  // get input elements
  slider_pop = document.getElementById("population");
  slider_r = document.getElementById("transmissionRate");
  slider_gamma = document.getElementById("recoveryRate");
  slider_mu = document.getElementById("mortalityRate");
  slider_imbr = document.getElementById("immuneBreakthroughRate");
  slider_vax = document.getElementById("vaccinationRate");
  slider_mob = document.getElementById("mobility");
  start_button = document.getElementById("start_button");
  check_rki = document.getElementById("use_rki");

  startSketch();
}

function startSketch() {
  (day = 0), (population = slider_pop.value);

  init_infectious = 1;
  
  console.log(data);
  console.log(data_vax.data);
  german_population=83000000;
  if (check_rki.checked) {
    slider_r.value = data.r.value;
    slider_gamma.value = data.recovered / data.cases;
    slider_mu.value = data.deaths / data.cases;
    //slider_vax.value = data_vax.data.vaccinated/german_population;
    init_infectious = (data.cases-data.deaths-data.recovered)*population/german_population;
  }
  
  transmissionRate = slider_r.value;
  recoveryRate = slider_gamma.value;
  mortalityRate = slider_mu.value;
  immuneBreakthroughRate = slider_imbr.value;
  vaccinationRate = slider_vax.value;
  mobilityRate = slider_mob.value;
  
  // make healthy population
  for (let i = 0; i < population; i++) {
    if (i>=init_infectious){
    persons[i] = new Person(
      i,
      random(width),
      random(height),
      person_size,
      "susceptible"
    );}
    else{persons[i] = new Person(
    population,
    random(width),
    random(height),
    person_size,
    "infectious"
  );}
  }

  //reset chart
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  chart.data.datasets[2].data = [];
  chart.data.labels = [];
  chart.update();
  // instantiate model
  model = new SIRD(
    population,
    init_infectious,
    transmissionRate,
    recoveryRate,
    mortalityRate
  );
  
  console.log(model);
  console.log(persons[0]);
}

function draw() {
  
  population_span.textContent = slider_pop.value;
  transmissionrate_span.textContent = slider_r.value;
  recoveryrate_span.textContent = slider_gamma.value;
  mortalityrate_span.textContent = slider_mu.value;
  vaccinationRate_span.textContent = slider_vax.value;
  immuneBreakthroughRate_span.textContent = slider_imbr.value;
  mobility_span.textContent = slider_mob.value;
  
  vaccinationRate = slider_vax.value;
  immuneBreakthroughRate= slider_imbr.value;
  mobilityRate = slider_mob.value
  //SImulation from here
  background(225);

  // 3 seconds = 1 day
  // each day
  if (frameCount % (60 * time_speed) == 0) {
    if (day == 0) {
      y0 = [
        model.init_cond.S0,
        model.init_cond.I0,
        model.init_cond.R0,
        model.init_cond.D0,
      ];
      model.updateStates(y0);
    } else {
      y0 = [
        model.current_states.S,
        model.current_states.I,
        model.current_states.R,
        model.current_states.D,
      ];
      model.updateStates(y0);
    }
    day++;
    infectious_count = persons.filter((item) => item.stat == "infectious")
      .length;
    recovered_count = persons.filter((item) => item.stat == "recovered").length;
    deceased_count = persons.filter((item) => item.stat == "deceased").length;
    addData(chart, day, infectious_count, recovered_count, deceased_count);
  }
  textSize(16);
  fill(233, 0, 0);
  textAlign(CENTER);
  text(day, width-30, height - 16);
  // lockdown
  //lockdown_rect = rect(35, height-32, 20, 20)
  image(lockdown_img, 35, height - 50, 40, 40);
  image(bed_img, 35 + 75, height - 50, 40, 40);
  image(event_img, 35 + 75*2, height - 50, 40, 40);
  // if lockdown
  lockdown =
    mouseIsPressed && collidePointRect(mouseX, mouseY, 35, height - 50, 50, 50);
  // if isloation
  isolation = collidePointRect(mouseX, mouseY, 35+75, height - 50, 50, 50);
  // if event
  event = collidePointRect(mouseX, mouseY, 35+75*2, height - 50, 50, 50);
  if (event){
    event_location = createVector(width/2,height/2)
    goEventProb = 0.2;
    rectMode(CENTER)
    strokeWeight(5);
    stroke(255);
    noFill();
    rect(event_location.x,event_location.y,150,150)
  }
  
  // Update the population of persons
  for (let person of persons) {
    person.show();
    // if lockdown
    if (lockdown) {
      person.spread = 0;
      textSize(60);
      fill(233, 0, 0, 20);
      textAlign(CENTER);
      text("LOCKDOWN", width / 2, height / 2);
    } else if(isolation && person.stat=="infectious"){
      person.spread = 0;
      textSize(60);
      fill(125, 30, 125, 12);
      textAlign(CENTER);
      text("Isolation", width / 2, height / 2);
    }else if(event && person.stat!="deceased"){
      person.move_event(event_location,mobility)
    }else{
      person.move_levy(mobilityRate);
    }
    // update health every day
    if (frameCount % (60 * time_speed) == 0) {
      person.updateHealth(
        model.getRecoveryProb(),
        model.getDeceasedProb(),
        immuneBreakthroughRate,
        vaccinationRate
      );
    }
  }

  // check each person colliding with each other person
  infection_probability = model.getInfectedProb(day);
  //console.log('rate: '+infection_probability)
  //console.log('rando: '+random())
  for (let i = 0; i < population; i++) {
    for (let j = 0; j < population; j++) {
      if (
        j != i &&
        collideCircleCircleVector(
          persons[i].position,
          persons[i].spread,
          persons[j].position,
          persons[j].spread
        )
      ) {
        // if collision infect with some rate
        if (random() < infection_probability) {
          if (
            (persons[i].stat == "infectious" &&
              persons[j].stat == "susceptible") ||
            (persons[j].stat == "infectious" &&
              persons[i].stat == "susceptible")
          ) {
            persons[i].stat = "infectious";
            persons[j].stat = "infectious";
          }
        }
      }
    }
  }
}
