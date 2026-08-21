import { Link } from "react-router-dom";

function UserRoles() {

    return (

        <section
            className="section-padding"
            style={{ background: "#fff8f4" }}
        >

            <div className="container">

                <h2 className="text-center fw-bold mb-5">
                    Join Feastify
                </h2>

                <div className="row">

                    <div className="col-lg-6 mb-4">

                        <div className="card shadow h-100">

                            <div className="card-body text-center">

                                <div style={{ fontSize: "4rem" }}>
                                    🧑‍🍳
                                </div>

                                <h3>
                                    Customer
                                </h3>

                                <p>
                                    Browse local caterings, place orders and
                                    support local chefs.
                                </p>

                                <Link
                                    to="/register"
                                    className="btn btn-primary"
                                >
                                    Register as Customer
                                </Link>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-6 mb-4">

                        <div className="card shadow h-100">

                            <div className="card-body text-center">

                                <div style={{ fontSize: "4rem" }}>
                                    👨‍🍳
                                </div>

                                <h3>
                                    Seller
                                </h3>

                                <p>
                                    Showcase your food and grow your
                                    business within your community.
                                </p>

                                <Link
                                    to="/register"
                                    className="btn btn-primary"
                                >
                                    Register as Seller
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );
}

export default UserRoles;