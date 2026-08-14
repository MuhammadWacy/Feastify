function HowItWorks() {

    const steps = [
        {
            title: "Create Account",
            icon: "📝",
            text: "Register quickly as a Customer or Seller."
        },
        {
            title: "Choose Your Role",
            icon: "👥",
            text: "Buy delicious meals or sell your food."
        },
        {
            title: "Enjoy Feastify",
            icon: "🍛",
            text: "Order, sell and connect with your community."
        }
    ];

    return (
        <section className="section-padding bg-light">

            <div className="container">

                <h2 className="text-center fw-bold mb-5">
                    How It Works
                </h2>

                <div className="row">

                    {steps.map((step, index) => (

                        <div
                            className="col-md-4 text-center mb-4"
                            key={index}
                        >

                            <div className="card h-100 shadow-sm">

                                <div className="card-body">

                                    <div style={{ fontSize: "4rem" }}>
                                        {step.icon}
                                    </div>

                                    <h4 className="mt-3">
                                        {step.title}
                                    </h4>

                                    <p>
                                        {step.text}
                                    </p>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default HowItWorks;