import { cartService } from "../01_firebase/firestore";

export function getActiveUserId(activeUser) {
  return activeUser?.id || activeUser?.uid || activeUser?.userId || "";
}

export async function addCartItem(activeUser, item) {
  const userId = getActiveUserId(activeUser);
  if (!userId) {
    throw new Error("Please sign in before adding travel plans to your cart.");
  }
  return cartService.addForUser(userId, item);
}
