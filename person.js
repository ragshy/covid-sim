let status = {
  susceptible: "#000000",
  infectious: "#ff0000",
  recovered: "#00B000",
  deceased: "#ffffff",
};

class Person {
  // Constructor to create a Person
  constructor(
    id_ = 0,
    // Position
    x_ = width / 2,
    y_ = height / 2,
    r_ = 2,
    stat_ = "susceptible"
  ) {
    this.id = id_;
    // move
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D().mult(0.3);
    this.position = createVector(x_, y_);
    this.maxspeed = 1.5; // Maximum speed
    this.maxforce = 0.05;
    //size
    this.diam = r_;
    //proximity/span
    this.spread = this.diam * 2;
    // health status
    this.stat = stat_;
    //
    this.eventGoProb = random(1);
    // vaccination status
    this.vaccinated = 0;
    //
    this.was_infectious = 0;
    this.days_infectious = 0;
    //
    this.days_immune = 0;
  }
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }

  move_event(target, mobility) {
    if (this.eventGoProb < 0.7) {
      this.move_levy(mobility);
      return 0;
    } else {
      if (this.position.x < 0 || this.position.x > width) {
        this.velocity.x = -1 * this.velocity.x;
      }
      if (this.position.y < 0 || this.position.y > height) {
        this.velocity.y = -1 * this.velocity.y;
      }
      this.acceleration.add(this.seek(target));
      this.velocity.add(this.acceleration);
      //noise = createVector(random(-1,1),random(-1,1));
      this.position.add(this.velocity); //.add(noise);
      // Reset acceleration to 0 each cycle
      this.acceleration.mult(createVector(0, 0));
    }
  }

  move_levy(mobility) {
    let step = p5.Vector.random2D();
    let levy_rate = mobility;
    if (random(100) < levy_rate) {
      step.mult(random(50 + mobility * 500, 100 + mobility * 500));
    } else {
      step.setMag(0.5 + mobility * 50);
    }
    if (this.stat == "deceased") {
      step = createVector(0, 0);
    }
    this.position.add(step);

    if (this.position.x < 0 || this.position.x > width) {
      this.position.sub(step.mult(2));
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.position.sub(step.mult(2));
    }
    // if too far out
    if (this.position.x < -10) {
      this.position.x = 10;
    }
    if (this.position.x > width + 10) {
      this.position.x = width - 10;
    }
    if (this.position.y < -10) {
      this.position.y = 10;
    }
    if (this.position.y > height + 10) {
      this.position.y = height - 10;
    }

    this.acceleration.mult(0);
  }

  show() {
    noStroke();
    fill(color(status[this.stat]));
    ellipse(this.position.x, this.position.y, this.diam / 2, this.diam / 2);
    //fill(0,0,0,30);
    //ellipse(this.x, this.y, this.spread, this.spread);
  }

  updateHealth(
    recoveryProb = 0.2,
    mortalityProb = 0.1,
    immuneBreakthroughProb = 0.001,
    vaccinationRate = 0.2
  ) {
    // life update
    if (this.stat == "infectious") {
      this.days_infectious++;
      let stay_infectious = 1 - recoveryProb - mortalityProb;
      let choice = Array.apply(null, Array(1)).map(() =>
        weightedChoice(
          ["infectious", "recovered", "deceased"],
          [stay_infectious, recoveryProb, mortalityProb]
        )
      );
      this.stat = choice;
    }

    // cured/genesen
    if (this.stat == "recovered") {
      if (random() < immuneBreakthroughProb) {
        this.stat = "susceptible";
        this.days_infectious = 0;
      }
    }
    if (this.stat == "susceptible") {
      if (random() < vaccinationRate) {
        this.stat = "recovered";
        this.days_infectious = 0;
      }
    }
  }
}
function weightedChoice(array, weights) {
  let s = weights.reduce((a, e) => a + e);
  let r = Math.random() * s;
  return array.find((e, i) => (r -= weights[i]) < 0);
}
