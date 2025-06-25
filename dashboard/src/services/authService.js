const getToken = () => {
  return localStorage.getItem("token"); // make sure you're storing the token in localStorage after login
};

export default getToken;