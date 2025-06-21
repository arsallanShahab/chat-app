export const storeUser = (user) => {
  localStorage.setItem("chatUser", JSON.stringify(user));
};

export const getStoredUser = () => {
  const user = localStorage.getItem("chatUser");
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("chatUser");
};
