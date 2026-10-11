import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCartStore } from "../store/cartStore";
import {
    createOrder,
    createPayment,
    verifyPayment
} from "../api/paymentApi";

// Validation schema
const checkoutSchema = z.object({
    name: z
        .string()
        .trim()
        .min(5, "Name must contain at least 5 characters"),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    phone: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Enter a valid 10-digit Indian mobile number"
        ),

    address: z
        .string()
        .trim()
        .min(5, "Address must contain at least 5 characters")
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
        formState: { errors, isSubmitting }
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema)
    });

    const onSubmit = async (data: CheckoutFormData) => {
        try {
            if (cartItems.length === 0) {
                alert("Your cart is empty");
                return;
            }

            // 1. Create order in backend
            const order = await createOrder(
                cartItems.map((item) => ({
                    productId: item.product.productId,
                    quantity: item.quantity
                }))
            );

            // 2. Create Razorpay order
            const payment = await createPayment(order.orderId);

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
                    email: data.email,
                    contact: data.phone
                },

                notes: {
                    address: data.address
                },

                handler: async function (response: any) {
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

                        // 5. Clear cart after verification
                        clearCart();

                        alert(
                            "Payment successful! Order ID: " +
                            order.orderId
                        );
                    } catch (error) {
                        console.error(
                            "Payment verification error:",
                            error
                        );

                        alert(
                            "Payment verification failed. Please contact support before retrying."
                        );
                    }
                },

                modal: {
                    ondismiss: function () {
                        console.log("Payment window closed");
                    }
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response: any) {
                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    alert("Payment failed. Please try again.");
                }
            );

            razorpay.open();
        } catch (error) {
            console.error("Order/payment error:", error);
            alert("Unable to start payment. Please try again.");
        }
    };

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Name */}
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>

                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        {...register("name")}
                    />

                    {errors.name && (
                        <p className="error-message">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        autoComplete="email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p className="error-message">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>

                    <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        autoComplete="tel-national"
                        {...register("phone")}
                    />

                    {errors.phone && (
                        <p className="error-message">
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Address */}
                <div className="form-group">
                    <label htmlFor="address">Delivery Address</label>

                    <textarea
                        id="address"
                        placeholder="Enter your complete delivery address"
                        autoComplete="street-address"
                        {...register("address")}
                    />

                    {errors.address && (
                        <p className="error-message">
                            {errors.address.message}
                        </p>
                    )}
                </div>

                <h3>Order Total: ₹{total}</h3>

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Processing..." : "Pay Order"}
                </button>
            </form>
        </div>
    );
}

export default CheckoutForm;
