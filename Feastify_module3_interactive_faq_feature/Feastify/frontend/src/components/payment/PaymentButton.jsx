function PaymentButton({ onClick, disabled }) {
    return (
        <button
            type="button"
            className="payment-button w-100"
            onClick={onClick}
            disabled={disabled}
        >
            {disabled
                ? "Select a payment method"
                : "Pay Now"}
        </button>
    );
}

export default PaymentButton;