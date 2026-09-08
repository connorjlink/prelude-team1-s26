import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { auth } from "../01_firebase/config_firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetch_users, userRigister, login_user } from "../Redux/Authantication/auth.action";
import { userService } from "../01_firebase/firestore";

const state = {
  number: "",
  otp: "",
  user_name: "",
  password: "",
  email: "",
  verify: false,
  otpVerify: false,
};

export const Register = () => {
  const [check, setCheck] = useState(state);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let exist = false;
  const { number, otp, verify, otpVerify, user_name, password, email } = check;

  const { user, isLoading } = useSelector((store) => {
    return {
      user: store.LoginReducer.user,
      isLoading: store.LoginReducer.isLoading,
    };
  });

  for (let i = 0; i <= user.length - 1; i++) {
    if (user[i].number === number && number) {
      exist = true;
      break;
    }
  }

  const setMsg = (success, error) => {
    const s = document.querySelector("#loginMesageSuccess");
    const e = document.querySelector("#loginMesageError");
    if (s) s.innerHTML = success || "";
    if (e) e.innerHTML = error || "";
  };

  const setEmailMsg = (success, error) => {
    setEmailSuccess(success || "");
    setEmailError(error || "");
    if (success || error) setMsg(success, error);
  };

  // Phone: complete registration after OTP verified
  const handleRegisterUser = async () => {
    if (!user_name.trim()) {
      setMsg("", "Please enter your full name.");
      return;
    }
    if (!password || password.length < 6) {
      setMsg("", "Password must be at least 6 characters.");
      return;
    }
    let newObj = {
      number,
      user_name: user_name.trim(),
      password,
      email: email.trim().toLowerCase(),
      dob: "",
      gender: "",
      marital_status: null,
    };
    setBusy(true);
    try {
      // If email provided, also create Firebase Auth user so email login works immediately
      if (newObj.email && newObj.email.includes("@")) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, newObj.email, password);
          await updateProfile(cred.user, { displayName: newObj.user_name }).catch(() => {});
        } catch (e) {
          // If email already in Firebase but not Firestore, allow Firestore creation
          if (e.code !== "auth/email-already-in-use") throw e;
        }
      }
      await dispatch(userRigister(newObj));
      setCheck(state);
      setMsg("Account created. Please sign in.", "");
      navigate("/login");
    } catch (e) {
      setMsg("", e.message || "Unable to create account.");
    } finally {
      setBusy(false);
    }
  };

  // Email + password direct registration (no OTP required)
  const handleEmailRegister = async () => {
    setEmailMsg("", "");
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = user_name.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setEmailMsg("", "Please enter a valid email address.");
      return;
    }
    if (!trimmedName) {
      setEmailMsg("", "Please enter your full name.");
      return;
    }
    if (!password || password.length < 6) {
      setEmailMsg("", "Password must be at least 6 characters.");
      return;
    }
    // local duplicate check
    if (user.some((u) => String(u.email).toLowerCase() === trimmedEmail)) {
      setEmailMsg("", "An account with this email already exists. Please sign in.");
      return;
    }
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(cred.user, { displayName: trimmedName }).catch(() => {});
      const payload = {
        number: number || "",
        user_name: trimmedName,
        password,
        email: trimmedEmail,
        uid: cred.user.uid,
        provider: "email",
      };
      await dispatch(userRigister(payload));
      setEmailMsg("Account created! Redirecting to sign in…", "");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      console.error("Email registration failed", error);
      let msg = error.message || "Unable to create account.";
      if (error.code === "auth/email-already-in-use") msg = "Email already in use. Try signing in.";
      if (error.code === "auth/invalid-email") msg = "Invalid email address.";
      if (error.code === "auth/weak-password") msg = "Password is too weak.";
      setEmailMsg("", msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleRegister = async () => {
    setEmailMsg("", "");
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
      // also check in-memory
      if (!existing) existing = user.find((u) => String(u.email).toLowerCase() === profileEmail) || null;
      const payload = existing || {
        number: gUser.phoneNumber || "",
        user_name: gUser.displayName || profileEmail.split("@")[0],
        email: profileEmail,
        uid: gUser.uid,
        provider: "google",
        password: "",
      };
      if (!existing) {
        await dispatch(userRigister(payload));
      }
      dispatch(login_user(payload.id ? payload : { ...payload, id: gUser.uid, email: profileEmail, user_name: payload.user_name }));
      setEmailMsg("Signed in with Google! Redirecting…", "");
      setTimeout(() => navigate("/"), 600);
    } catch (error) {
      console.error("Google sign-in failed", error);
      let msg = error.message || "Google sign-in failed.";
      if (error.code === "auth/popup-blocked") msg = "Pop-up blocked. Please allow pop-ups.";
      if (error.code === "auth/unauthorized-domain") msg = "Domain not authorized in Firebase console. Add localhost to authorized domains.";
      setEmailMsg("", msg);
    } finally {
      setBusy(false);
    }
  };

  function onCapture() {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    // If container not yet mounted, defer
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

  async function handleVerifyNumber() {
    const nextButton = document.querySelector("#nextButton");
    if (nextButton) nextButton.innerText = "Please wait...";
    const phoneNumber = `+1${number}`;
    if (String(number).length !== 10) {
      if (nextButton) nextButton.innerText = "Next";
      setMsg("", "Phone number is invalid! Enter 10 digits.");
      return;
    }
    if (exist) {
      if (nextButton) nextButton.innerText = "Next";
      setMsg("", "User already exists");
      return;
    }
    try {
      const verifier = onCapture();
      if (!verifier) throw new Error("reCAPTCHA not ready. Please refresh.");
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setCheck({ ...check, verify: true });
      setMsg(`OTP sent to ${number}! If you don't receive an SMS (Firebase phone auth requires a Blaze billing plan), please use Email registration above.`, "");
      if (nextButton) nextButton.style.display = "none";
    } catch (error) {
      console.error("Unable to send registration OTP.", error);
      if (nextButton) nextButton.innerText = "Next";
      let msg = "Unable to send the verification code. Please try again.";
      if (error.code === "auth/billing-not-enabled" || String(error.message).includes("Billing")) {
        msg = "Phone OTP is disabled on this Firebase project (requires Blaze plan). Please use Email & Password registration above — no Firebase config change needed beyond Email/Password being enabled (already is).";
      } else if (error.code === "auth/invalid-phone-number") msg = "Invalid phone number format.";
      else if (error.code === "auth/too-many-requests") msg = "Too many attempts. Try again later or use email.";
      else if (error.code === "auth/captcha-check-failed") msg = "reCAPTCHA failed. Refresh and try again.";
      setMsg("", msg);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }

  function verifyCode() {
    if (!window.confirmationResult) {
      setMsg("", "No OTP session. Please click Next again.");
      return;
    }
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        setCheck({ ...check, otpVerify: true });
        setMsg("Verification successful. Complete your profile below.", "");
        const ln = document.querySelector("#loginNumber");
        const lo = document.querySelector("#loginOtp");
        if (ln) ln.style.display = "none";
        if (lo) lo.style.display = "none";
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
    dispatch(fetch_users);
    // render recaptcha after mount - retry if container not ready
    const t = setTimeout(() => {
      try {
        const verifier = onCapture();
        if (verifier) verifier.render().catch((error) => console.error("Unable to render registration reCAPTCHA.", error));
      } catch (e) {
        console.error("reCAPTCHA init failed", e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="mainLogin">
        <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
        <div className="loginBx">
          <div className="loginHead">
            <hr /><hr /><hr />
            <h1>Register</h1>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "6px" }}>
              No Firebase project changes needed — Email/Password and Google are already enabled. Phone OTP requires Blaze billing; use email if SMS doesn’t arrive.
            </p>
          </div>

          {/* Email + Password registration (recommended) */}
          <div style={{ padding: "10px 20px", border: "1px solid var(--border)", borderRadius: "8px", margin: "0 20px", background: "var(--soft-green, #f7f8f4)" }}>
            <h3 style={{ fontSize: "13px", margin: "0 0 10px", color: "var(--ink)" }}>Register with Email &amp; Password</h3>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <label>Full name</label>
              <span>
                <input type="text" name="user_name" value={user_name} onChange={handleChangeMobile} placeholder="Jane Doe" />
              </span>
            </div>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <label>Email</label>
              <span>
                <input type="email" name="email" value={email} onChange={handleChangeMobile} placeholder="you@example.com" />
              </span>
            </div>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <label>Password (min 6 chars)</label>
              <span>
                <input type="password" name="password" value={password} onChange={handleChangeMobile} placeholder="••••••••" />
              </span>
            </div>
            <div className="loginInputB" style={{ padding: "6px 0" }}>
              <button onClick={handleEmailRegister} disabled={busy} style={{ width: "100%" }}>
                {busy ? "Please wait..." : "Create account with Email"}
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
              onClick={handleGoogleRegister}
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

          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--muted-light)", margin: "6px 0 -2px" }}>— or verify a phone number —</div>

          <div className="loginInputB" id="loginNumber">
            <label htmlFor="">Enter Your Phone (10 digits, US +1)</label>
            <span>
              <input
                type="number"
                readOnly={verify}
                name="number"
                value={number}
                onChange={(e) => handleChangeMobile(e)}
                placeholder="Number"
              />
              <button disabled={verify || busy} onClick={handleVerifyNumber} id="nextButton">
                Next
              </button>
            </span>
            <p style={{ fontSize: "11px", color: "var(--muted-light)", margin: "4px 0 0" }}>
              SMS delivery requires Firebase Blaze plan &amp; phone auth enabled. If no OTP arrives, use email registration above.
            </p>
          </div>
          {verify ? (
            <div className="loginInputB" id="loginOtp">
              <label htmlFor="">Enter OTP</label>
              <span>
                <input type="number" name="otp" value={otp} onChange={(e) => handleChangeMobile(e)} />
                <button onClick={verifyCode}>Verify OTP</button>
              </span>
            </div>
          ) : (
            ""
          )}

          {otpVerify ? (
            <>
              <div className="loginInputB">
                <label>Confirm full name</label>
                <span>
                  <input type="text" name="user_name" value={user_name} onChange={(e) => handleChangeMobile(e)} />
                </span>
              </div>
              <div className="loginInputB">
                <label>Email (optional, enables email login)</label>
                <span>
                  <input type="email" name="email" value={email} onChange={(e) => handleChangeMobile(e)} placeholder="you@example.com" />
                </span>
              </div>
              <div className="loginInputB">
                <label>Your Password</label>
                <span>
                  <input type="password" name="password" value={password} onChange={(e) => handleChangeMobile(e)} />
                </span>
              </div>
              <div className="loginInputB">
                <button onClick={handleRegisterUser} disabled={busy}>Continue</button>
              </div>
            </>
          ) : (
            ""
          )}

          {isLoading ? <h1>Please wait...</h1> : ""}

          <div className="loginTerms">
            <div className="inpChecbx"><input className="inp" type="checkbox" /> <h2>Keep me signed in</h2></div>
            <p>Selecting this checkbox will keep you signed into your account on this device until you sign out. Do not select this on shared devices.</p>
            <h6>By signing in, I agree to the Expedia <span> Terms and Conditions</span>, <span>Privacy Statement</span> and <span>Expedia Rewards Terms and Conditions</span>.</h6>
            <Link to="/login" style={{ color: "var(--coral)", fontSize: "13px", fontWeight: 600 }}>Already have an account? Sign in</Link>
          </div>
          <br />
          <h3 id="loginMesageError"></h3>
          <h3 id="loginMesageSuccess"></h3>
        </div>
      </div>
    </>
  );
};
