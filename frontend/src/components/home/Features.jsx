function Features() {

    const features = [
        "Best Meals from Best Caterers",
        "Trusted Local Sellers",
        "Secure Payments",
        "Location-Based Matching",
        "Easy Order Management",
        "Community Driven"
    ];

    return (
        <section className="section-padding">

            <div className="container">

                <h2 className="text-center fw-bold mb-5">
                    Why Choose Feastify?
                </h2>

                <div className="row">

                    {features.map((feature, index) => (

                        <div
                            key={index}
                            className="col-md-4 mb-4"
                        >

                            <div className="card shadow-sm h-100">

                                <div className="card-body text-center">

                                    <div className="feature-icon mb-3">
                                        ✓
                                    </div>

                                    <h5>
                                        {feature}
                                    </h5>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default Features;