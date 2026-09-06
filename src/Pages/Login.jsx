import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import firebase_app from "../01_firebase/config_firebase";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { userService } from "../01_firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, login_user } from "../Redux/Authantication/auth.action";

const auth = getAuth(firebase_app);
const state = {
  number: "",
  otp: "",
  verify: false,
};

export const Login = () => {
  const [check, setCheck] = useState(state);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, activeUser, user } = useSelector((store) => {
    return {
      isAuth: store.LoginReducer.isAuth,
      activeUser: store.LoginReducer.activeUser,
      user: store.LoginReducer.user,
    };
  });

  const { number, otp, verify } = check;

  let exist = false;
  let data = {};

  for (let i = 0; i <= user.length - 1; i++) {
    if (user[i].number == number) {
      exist = true;
      data = user[i];
      break;
    }
  }
  // console.log(user)
  //

  function onCapture() {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(
      recaptchaContainerRef.current,
      {
        size: "normal",
        callback: () => {},
      },
      auth
    );
    return recaptchaVerifierRef.current;
  }

  async function handleVerifyNumber() {
    const nextButton = document.querySelector("#nextText");
    nextButton.innerText = "Please wait...";
    const normalizedNumber = String(number).replace(/\D/g, "");
    const phoneNumber = `+1${normalizedNumber}`;
    if (number.length === 10) {
      let matchedUser = data.number ? data : null;
      try {
        matchedUser = matchedUser || await userService.getByPhone(normalizedNumber);
      } catch (error) {
        console.error("Unable to find the user in Firestore.", error);
      }
      if (matchedUser) {
        data = matchedUser;
        try {
          const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            onCapture()
          );
          window.confirmationResult = confirmationResult;
          setCheck({ ...check, verify: true });
          document.querySelector(
            "#loginMesageSuccess"
          ).innerHTML = `Otp sent to ${number}!`;
          document.querySelector("#loginMesageError").innerHTML = "";
          nextButton.style.display = "none";
        } catch (error) {
          console.error("Unable to send login OTP.", error);
          nextButton.innerText = "Log In";
          document.querySelector("#loginMesageError").innerHTML =
            "Unable to send the verification code. Please try again.";
          if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          }
        }
      } else {
        document.querySelector("#loginMesageSuccess").innerHTML = ``;
        document.querySelector("#loginMesageError").innerHTML =
          "User does not exist. Please create an account.";
          setInterval(() => {
            window.location="/register"
          }, 1000);
      }
      //
    } else {
      nextButton.innerText = "Log In";
      document.querySelector("#loginMesageSuccess").innerHTML = ``;
      document.querySelector("#loginMesageError").innerHTML =
        "Phone number is invalid!";
    }
  }

  //
  function verifyCode() {
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;

        document.querySelector(
          "#loginMesageSuccess"
        ).innerHTML = `Verification successful`;
        document.querySelector("#loginMesageError").innerHTML = "";

        dispatch(login_user(data));
        // ...
      })
      .catch((error) => {
        // User couldn't sign in (bad verification code?)
        document.querySelector("#loginMesageSuccess").innerHTML = ``;
        document.querySelector("#loginMesageError").innerHTML = "Invalid OTP";
        // ...
      });
  }

  //
  const handleChangeMobile = (e) => {
    let val = e.target.value;
    setCheck({ ...check, [e.target.name]: val });
  };
  // console.log(isAuth)

  useEffect(() => {
    dispatch(fetch_users);
    if (isAuth) {
      window.location = "/";
    }
  }, [dispatch, isAuth]);

  useEffect(() => {
    const verifier = onCapture();
    verifier.render().catch((error) => {
      console.error("Unable to render login reCAPTCHA.", error);
    });
    return () => {
    }
  }, []);

  return (
    <>
      <div className="mainLogin">
        <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
        <div className="loginBx">
          <div className="loginHead">
          <hr /><hr /><hr />
            <h1>Login</h1>
          </div>
          <div className="loginInputB">
            <label htmlFor="">Enter Your Number</label>
            <span>
              <input
                type="number"
                readOnly={verify}
                name="number"
                value={number}
                onChange={(e) => handleChangeMobile(e)}
                placeholder="Number"
              />
              <button
                disabled={verify}
                onClick={handleVerifyNumber}
                id="nextText"
              >
                Log In
              </button>
            </span>
          </div>
          {verify ? (
            <div className="loginInputB">
              <label htmlFor="">Enter Your OTP</label>
              <span>
                <input
                  type="number"
                  name="otp"
                  value={otp}
                  onChange={(e) => handleChangeMobile(e)}
                />
                <button onClick={verifyCode}>Continue</button>
              </span>
            </div>
          ) : (
            ""
          )}

          <div className="loginTerms">
            {/* <h2>Or USE ARE BUSSINESS ACCOUNT WITH</h2>
                    <p>By proceeding, you agree to MakeMyTrip'sT&Csand Privacy</p> */}
            <Link to="/register">Need to create an account?</Link>
            <Link to="/admin">Admin Login</Link>
            <div className="inpChecbx"><input className="inp" type="checkbox" /> <h2>Keep me signed in</h2></div>
            <p>Selecting this checkbox will keep you signed into your account on this device until you sign out. Do not select this on shared devices.</p>
            <h6>By signing in, I agree to the Expedia <span> Terms and Conditions</span>, <span>Privacy Statement</span> and <span>Expedia Rewards Terms and Conditions</span>.</h6>
          </div>
          <h3 id="loginMesageError"></h3>
          <h3 id="loginMesageSuccess"></h3>
        </div>
      </div>
    </>
  );
};
