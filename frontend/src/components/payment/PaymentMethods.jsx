import PaymentMethodCard from "./PaymentMethodCard";

function PaymentMethods({
    selectedMethod,
    onMethodChange,
}) {
    const paymentMethods = [
        {
            id: "bkash",
            name: "bKash",
            description: "Pay securely using bKash",
            icon: "📱",
        },
        {
            id: "nagad",
            name: "Nagad",
            description: "Pay securely using Nagad",
            icon: "💳",
        },
        {
            id: "card",
            name: "Card",
            description: "Pay using a debit or credit card",
            icon: "💳",
        },
    ];

    return (
        <div className="card shadow-sm border-0">

            <div className="card-body p-4">

                <h3 className="fw-bold mb-4">
                    Payment Method
                </h3>

                <div className="d-flex flex-column gap-3">

                    {paymentMethods.map((method) => (
                        <PaymentMethodCard
                            key={method.id}
                            name={method.name}
                            description={method.description}
                            icon={method.icon}
                            selected={
                                selectedMethod === method.id
                            }
                            onSelect={() =>
                                onMethodChange(method.id)
                            }
                        />
                    ))}

                </div>

            </div>

        </div>
    );
}

export default PaymentMethods;