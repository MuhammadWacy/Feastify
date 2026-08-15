import API from "./api";

const createPayment = async ({
    amount,
    currency,
    paymentMethod,
    customerEmail,
}) => {

    const response = await API.post(
        "/payment/create",
        {
            amount,
            currency,
            paymentMethod,
            customerEmail,
        }
    );

    return response.data;
};

export default createPayment;