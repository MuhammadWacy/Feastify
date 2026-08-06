function Footer() {
    return (
        <footer
            className="text-center text-white py-3"
            style={{
                backgroundColor: "#FF7034",
            }}
        >
            <div className="container">

                <h5 className="fw-bold">
                    🍽 Feastify
                </h5>

                <p className="mb-1">
                    Connecting Customers with Caterers
                </p>

                <small>
                    © {new Date().getFullYear()} Feastify. All Rights Reserved.
                </small>

            </div>
        </footer>
    );
}

export default Footer;