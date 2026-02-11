import React from 'react';

const steps = [
  {
    id: 1,
    title: "Register",
    desc: "Create your profile to get started.",
    icon: "fa-user-plus"
  },
  {
    id: 2,
    title: "Select Dome",
    desc: "Choose your preferred stall on the map.",
    icon: "fa-map-location-dot"
  },
  {
    id: 3,
    title: "Secure Payment",
    desc: "Pay online securely to book your spot.",
    icon: "fa-credit-card"
  },
  {
    id: 4,
    title: "Get Entry Pass",
    desc: "Receive your digital pass instantly.",
    icon: "fa-ticket-alt"
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-header">
        <h2>How It Works</h2>
        <p>From registration to setup in 4 simple steps.</p>
      </div>

      <div className="steps-container">
        {steps.map((step) => (
          <div className="step-card" key={step.id}>
            <div className="step-number">
              <i className={`fas ${step.icon}`}></i>
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;