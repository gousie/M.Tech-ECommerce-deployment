import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCartStore } from "../store/cartStore";
import {
    createOrder,
    createPayment,
    verifyPayment
} from "../api/paymentApi";

const checkoutSchema = z.object({
    name: z.string().min(2, "Name is required"),
    //email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number is required"),
    address: z.string().min(5, "Address is required")
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

declare global {
    interface Window {
        Razorpay: any;
    }
}

function CheckoutForm() {

    const cartItems = useCartStore(
        (state) => state.cartItems
    );

    const getTotal = useCartStore(
        (state) => state.getTotal
    );

    const clearCart = useCartStore(
        (state) => state.clearCart
    );

    const total = getTotal();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema)
    });

    const onSubmit = async (
        data: CheckoutFormData
    ) => {

        try {

            if (cartItems.length === 0) {
                alert("Your cart is empty");
                return;
            }

            // 1. Create order in our backend
            const order = await createOrder(
                cartItems.map((item) => ({
                    productId: item.product.productId,
                    quantity: item.quantity
                }))
            );

            // 2. Create Razorpay order
            const payment = await createPayment(
                order.orderId
            );

            // 3. Open Razorpay Checkout
            const options = {

                key: payment.keyId,

                amount: payment.amount,

                currency: payment.currency,

                name: "SmartCart",

                description: "E-Commerce Order",

                order_id: payment.razorpayOrderId,

                prefill: {
                    name: data.name,
                   // email: data.email,
                    contact: data.phone
                },

                notes: {
                    address: data.address
                },

                handler: async function (
                    response: any
                ) {

                    try {

                        // 4. Verify payment on backend
                        await verifyPayment({
                            orderId: order.orderId,
                            razorpayOrderId:
                                response.razorpay_order_id,
                            razorpayPaymentId:
                                response.razorpay_payment_id,
                            razorpaySignature:
                                response.razorpay_signature
                        });

                        // 5. Payment successful
                        clearCart();

                        alert(
                            "Payment successful! Order ID: "
                            + order.orderId
                        );

                    } catch (error) {

                        console.error(
                            "Payment verification error:",
                            error
                        );

                        alert(
                            "Payment verification failed"
                        );
                    }
                },

                modal: {
                    ondismiss: function () {
                        console.log(
                            "Payment window closed"
                        );
                    }
                }
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response: any) {

                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    alert(
                        "Payment failed"
                    );
                }
            );

            razorpay.open();

        } catch (error) {

            console.error(
                "Order/payment error:",
                error
            );

            alert(
                "Unable to start payment"
            );
        }
    };

    return (
        <div className="checkout-container">

            <h2>Checkout</h2>

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="error-message">
                            {errors.name.message}
                        </p>
                    )}
                </div>

              

                <div className="form-group">
                    <label>Phone</label>
                    <input
                        type="text"
                        placeholder="Enter your phone number"
                        {...register("phone")}
                    />
                    {errors.phone && (
                        <p className="error-message">
                            {errors.phone.message}
                        </p>
                    )}
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <textarea
                        placeholder="Enter your address"
                        {...register("address")}
                    />
                    {errors.address && (
                        <p className="error-message">
                            {errors.address.message}
                        </p>
                    )}
                </div>
                <h3>
                    Order Total: ₹{total}
                </h3>
                <button type="submit">
                    Pay Order
                </button>
            </form>
        </div>
    );
}

export default CheckoutForm;
