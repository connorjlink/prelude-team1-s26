import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { auth } from "../01_firebase/config_firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { userService } from "../01_firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, login_user } from "../Redux/Authantication/auth.action";

const state = {
  number: "",
  otp: "",
  verify: false,
  email: "",
  password: "",
};

export const Login = () => {
  const [check, setCheck] = useState(state);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, activeUser, user } = useSelector((store) => {
    return {
      isAuth: store.LoginReducer.isAuth,
      activeUser: store.LoginReducer.activeUser,
      user: store.LoginReducer.user,
    };
  });

  const { number, otp, verify, email, password } = check;

  let exist = false;
  let data = {};

  for (let i = 0; i <= user.length - 1; i++) {
    if (user[i].number == number) {
      exist = true;
      data = user[i];
      break;
    }
  }

  const setMsg = (success, error) => {
    const s = document.querySelector("#loginMesageSuccess");
    const e = document.querySelector("#loginMesageError");
    if (s) s.innerHTML = success || "";
    if (e) e.innerHTML = error || "";
  };

  function onCapture() {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    if (!recaptchaContainerRef.current) return null;
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          // Handle expiration
        }
      },
      auth
    );
    return recaptchaVerifierRef.current;
  }

  const handleEmailLogin = async () => {
    setEmailError("");
    setEmailSuccess("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("Enter a valid email.");
      return;
    }
    if (!password) {
      setEmailError("Enter your password.");
      return;
    }
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmed, password);
      // try Firestore profile, fallback to Firebase user
      let profile = null;
      try {
        profile = await userService.getByEmail(trimmed);
      } catch (_) {}
      if (!profile) profile = user.find((u) => String(u.email).toLowerCase() === trimmed) || null;
      const payload = profile || {
        id: cred.user.uid,
        email: trimmed,
        user_name: cred.user.displayName || trimmed.split("@")[0],
        number: cred.user.phoneNumber || "",
      };
      dispatch(login_user(payload));
      setEmailSuccess("Signed in! Redirecting…");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Email login failed", error);
      let msg = error.message;
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") msg = "Invalid email or password.";
      if (error.code === "auth/user-not-found") msg = "No account with that email.";
      if (error.code === "auth/too-many-requests") msg = "Too many attempts. Try later.";
      setEmailError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setEmailError("");
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      const profileEmail = (gUser.email || "").toLowerCase();
      let existing = null;
      try {
        existing = await userService.getByEmail(profileEmail);
      } catch (_) {}
      if (!existing) existing = user.find((u) => String(u.email).toLowerCase() === profileEmail) || null;
      // auto-provision if first time
      let payload = existing;
      if (!existing) {
        const newDoc = {
          email: profileEmail,
          user_name: gUser.displayName || profileEmail.split("@")[0],
          number: gUser.phoneNumber || "",
          uid: gUser.uid,
          provider: "google",
          password: "",
        };
        // create without dispatching register flow - use service directly to avoid double dispatch shape
        try {
          const created = await userService.create(newDoc);
          payload = { ...newDoc, id: created.id };
        } catch (_) {
          payload = { ...newDoc, id: gUser.uid };
        }
      }
      dispatch(login_user(payload));
      setTimeout(() => navigate("/"), 400);
    } catch (error) {
      console.error("Google login failed", error);
      let msg = error.message;
      if (error.code === "auth/popup-blocked") msg = "Pop-up blocked. Allow pop-ups.";
      if (error.code === "auth/unauthorized-domain") msg = "Add localhost to Firebase Authorized domains.";
      setEmailError(msg);
    } finally {
      setBusy(false);
    }
  };

  async function handleVerifyNumber() {
    const nextButton = document.querySelector("#nextText");
    if (nextButton) nextButton.innerText = "Please wait...";
    const normalizedNumber = String(number).replace(/\D/g, "");
    const phoneNumber = `+1${normalizedNumber}`;
    if (String(number).length !== 10) {
      if (nextButton) nextButton.innerText = "Log In";
      setMsg("", "Phone number is invalid!");
      return;
    }
    let matchedUser = data.number ? data : null;
    try {
      matchedUser = matchedUser || (await userService.getByPhone(normalizedNumber));
    } catch (error) {
      console.error("Unable to find the user in Firestore.", error);
    }
    // also allow email-registered users to have empty number - don't block
    if (!matchedUser) {
      setMsg("", "User does not exist. Please create an account.");
      if (nextButton) nextButton.innerText = "Log In";
      setTimeout(() => {
        navigate("/register");
      }, 1200);
      return;
    }
    data = matchedUser;
    try {
      const verifier = onCapture();
      if (!verifier) throw new Error("reCAPTCHA not ready");
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setCheck({ ...check, verify: true });
      setMsg(`OTP sent to ${number}! If no SMS arrives, your project may need Blaze billing — use Email sign-in above.`, "");
      if (nextButton) nextButton.style.display = "none";
    } catch (error) {
      console.error("Unable to send login OTP.", error);
      if (nextButton) nextButton.innerText = "Log In";
      let msg = "Unable to send the verification code. Please try again.";
      if (error.code === "auth/billing-not-enabled" || String(error.message).includes("Billing")) {
        msg = "Phone OTP disabled (Firebase requires Blaze plan for SMS). Please sign in with Email & Password or Google above.";
      } else if (error.code === "auth/captcha-check-failed") msg = "reCAPTCHA failed. Refresh and retry.";
      else if (error.code === "auth/too-many-requests") msg = "Too many SMS attempts. Use email sign-in.";
      setMsg("", msg);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }

  function verifyCode() {
    if (!window.confirmationResult) {
      setMsg("", "No OTP session found. Please resend code.");
      return;
    }
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        setMsg("Verification successful", "");
        dispatch(login_user(data));
        setTimeout(() => navigate("/"), 400);
      })
      .catch((error) => {
        setMsg("", "Invalid OTP");
      });
  }

  const handleChangeMobile = (e) => {
    let val = e.target.value;
    setCheck({ ...check, [e.target.name]: val });
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [dispatch, isAuth, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const verifier = onCapture();
        if (verifier) verifier.render().catch((error) => console.error("Unable to render login reCAPTCHA.", error));
      } catch (e) {
        console.error("reCAPTCHA init failed", e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="mainLogin">
        {/* Add an inline style wrapper so reCAPTCHA cleanup finds its parent */}
        <div style={{ minHeight: "78px" }}>
          <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
        </div>
        <div className="loginBx">
          <div className="loginHead">
            <hr /><hr /><hr />
            <h1>Login</h1>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
              Email/Password and Google work with current Firebase config. Phone OTP needs Blaze billing — use email if SMS fails.
            </p>
          </div>

          {/* Email + Password login */}
          <div style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: "8px", margin: "0 20px", background: "var(--soft-green, #f7f8f4)" }}>
            <h3 style={{ fontSize: "13px", margin: "0 0 10px", color: "var(--ink)" }}>Sign in with Email</h3>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <label>Email</label>
              <span>
                <input type="email" name="email" value={email} onChange={handleChangeMobile} placeholder="you@example.com" />
              </span>
            </div>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <label>Password</label>
              <span>
                <input type="password" name="password" value={password} onChange={handleChangeMobile} placeholder="••••••••" />
              </span>
            </div>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <button onClick={handleEmailLogin} disabled={busy} style={{ width: "100%" }}>
                {busy ? "Please wait..." : "Sign in"}
              </button>
            </div>
            {emailError && <p style={{ color: "#b44632", fontSize: "12px", margin: "6px 0 0" }}>{emailError}</p>}
            {emailSuccess && <p style={{ color: "#3c7d62", fontSize: "12px", margin: "6px 0 0" }}>{emailSuccess}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0 4px" }}>
              <hr style={{ flex: 1 }} />
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>OR</span>
              <hr style={{ flex: 1 }} />
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={busy}
              style={{
                width: "100%",
                padding: "9px 16px",
                background: "#fff",
                color: "var(--ink)",
                border: "1px solid var(--border-strong)",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Continue with Google
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--muted-light)", margin: "8px 0 -2px" }}>— or sign in with phone —</div>

          <div className="loginInputB">
            <label htmlFor="">Enter Your Number</label>
            <span>
              <input type="number" readOnly={verify} name="number" value={number} onChange={(e) => handleChangeMobile(e)} placeholder="Number" />
              <button disabled={verify || busy} onClick={handleVerifyNumber} id="nextText">
                Log In
              </button>
            </span>
            <p style={{ fontSize: "11px", color: "var(--muted-light)", margin: "4px 0 0" }}>
              Requires Blaze billing for SMS. If no code arrives, use email above.
            </p>
          </div>
          {verify ? (
            <div className="loginInputB">
              <label htmlFor="">Enter Your OTP</label>
              <span>
                <input type="number" name="otp" value={otp} onChange={(e) => handleChangeMobile(e)} />
                <button onClick={verifyCode}>Continue</button>
              </span>
            </div>
          ) : (
            ""
          )}

          <div className="loginTerms">
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
