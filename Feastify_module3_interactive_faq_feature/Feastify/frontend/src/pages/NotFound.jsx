import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="container text-center mt-5">

            <h1 className="display-1 fw-bold">
                404
            </h1>

            <h3>
                Page Not Found
            </h3>

            <p>
                The page you are looking for does not exist.
            </p>

            <Link
                to="/"
                className="btn btn-primary"
            >
                Return Home
            </Link>

        </div>
    );
}

export default NotFound;