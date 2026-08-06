import { Link } from "react-router-dom";

function Hero() {
    return (
        <section className="hero section-padding">
            <div className="container">

                <div className="row align-items-center">

                    <div className="col-lg-6">

                        <h1 className="display-4 fw-bold mb-3">
                            Food for Largescale Events,
                            <span className="text-primary">
                                {" "}Delivered with Trust
                            </span>
                        </h1>

                        <p className="lead mb-4">
                            Feastify connects local caterers with customers,
                            making event meals more accessible while creating
                            opportunities for passionate caterers.
                        </p>

                        <Link
                            to="/register"
                            className="btn btn-primary btn-lg me-3"
                        >
                            Get Started
                        </Link>

                        <Link
                            to="/login"
                            className="btn btn-outline-dark btn-lg"
                        >
                            Login
                        </Link>

                    </div>

                    <div className="col-lg-6 text-center mt-5 mt-lg-0">

                        <div
                            className="rounded-circle d-inline-flex justify-content-center align-items-center shadow"
                            style={{
                                width: "300px",
                                height: "300px",
                                background: "#fff",
                                fontSize: "7rem"
                            }}
                        >
                            🍽
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default Hero;