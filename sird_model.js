class SIRD {
  constructor(N_ = 1000, I0_ = 1, beta_ = 1, gamma_ = 1 / 14, mu_ = 0.001) {
    this.name = "SIRD";
    // population
    this.N = N_;
    
    // beta: infection rate
    // gamma: recovery rate
    // mu: mortality
    this.parameters = {beta: beta_,gamma:gamma_,mu:mu_}
    
    //initial conditions
    let S0 = this.N - I0_;
    this.init_cond = {S0: S0, I0: I0_, R0: 0, D0: 0 };
    
    // states: 
    // S: Susceptible
    // I: Infectious
    // R: Recovered
    // D: Deceased
    this.current_states = { S: 0, I: 0, R: 0, D: 0 };

  }

  ode(t, y) {
    let N = this.N;
    let beta = this.parameters.beta;
    let gamma = this.parameters.gamma;
    let mu = this.parameters.mu;

    let dy0 = -(beta / N) * y[1] * y[0];
    let dy1 = (beta / N) * y[1] * y[0] - gamma * y[1] - mu * y[1];
    let dy2 = gamma * y[1];
    let dy3 = mu * y[1];
    return [dy0, dy1, dy2, dy3];
  }

  updateStates(y0, t=0) {
    // euler integration
    let f_y = this.ode(t,y0);
    let y_next = math.add(y0, f_y);
    [
      this.current_states.S,
      this.current_states.I,
      this.current_states.R,
      this.current_states.D,
    ] = y_next;
  }
  getInfectedProb() {
    return this.current_states.I / this.N;
  }
  getRecoveryProb() {
    return this.current_states.R / this.N;
  }
  getDeceasedProb() {
    return this.current_states.D / this.N;
  }
}
