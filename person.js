let status = {
  "unexposed": "#000000",
  "infected": "#ff0000",
  "immune": "#00B000",
  "deceased": "#000090"
};

class Person {
  // Constructor to create a Person
  constructor(
    id_ = 0,
    x_ = width / 2,
    y_ = height / 2,
    vx_ = random(-2, 2),
    vy_ = random(-2, 2),
    stat_ = "unexposed",
    r_ = 2,
    spread_ = 30
    ) {
    this.id = id_;
    this.x = x_;
    this.y = y_;
    this.vx = vx_;
    this.vy = vy_;
    this.stat = stat_;
    //size
    this.diam = r_;
    //proximity/span
    this.spread = spread_
  }
  move() {
    if (this.x < 0 || this.x > width) {
      this.vx = -1 * this.vx;
    }
    if (this.y < 0 || this.y > height) {
      this.vy = -1 * this.vy;
    }
    this.x += this.vx;
    this.y += this.vy;
  }


  show() {
    noStroke();
    fill(color(status[this.stat]));
    ellipse(this.x, this.y, this.diam / 2, this.diam / 2);
    //fill(0,0,0,30);
    //ellipse(this.x, this.y, this.spread, this.spread);
  }
}