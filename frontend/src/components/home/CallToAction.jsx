import { Link } from "react-router-dom";

function CallToAction() {

    return (

        <section
            className="section-padding text-center text-white"
            style={{ backgroundColor: "#FF7034" }}
        >

            <div className="container">

                <h2 className="fw-bold mb-3">
                    Ready to Join Feastify?
                </h2>

                <p className="lead mb-4">
                    Whether you're enjoying a birthday party or a big corporate event or ready to serve as 
                    a caterer, Feastify is the place to connect.
                </p>

                <Link
                    to="/register"
                    className="btn btn-light btn-lg"
                >
                    Create Your Account
                </Link>

            </div>

        </section>

    );
}

export default CallToAction;