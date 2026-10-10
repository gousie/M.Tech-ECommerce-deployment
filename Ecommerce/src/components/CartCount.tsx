
import { useAtom } from "jotai";
import { cartItemsAtom } from "../store/cartAtoms";

function CartCount() {
    const [cartItems] = useAtom(cartItemsAtom);

    return (
        <p>
            Items in Cart: {cartItems.length}
        </p>
    );
}

export default CartCount;
