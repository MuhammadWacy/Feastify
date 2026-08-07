function PaymentMethodCard({
    name,
    description,
    icon,
    selected,
    onSelect,
}) {
    return (
        <button
            type="button"
            className={`payment-method-card ${
                selected ? "selected" : ""
            }`}
            onClick={onSelect}
        >
            <div className="payment-method-icon">
                {icon}
            </div>

            <div className="payment-method-content">
                <h5 className="mb-1">
                    {name}
                </h5>

                <p className="text-muted mb-0">
                    {description}
                </p>
            </div>

            <div className="payment-method-radio">
                <span
                    className={`payment-radio ${
                        selected ? "active" : ""
                    }`}
                />
            </div>
        </button>
    );
}

export default PaymentMethodCard;