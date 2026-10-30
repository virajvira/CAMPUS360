import { firebaseConfig, firebaseConfigReady } from "./firebase-config.js";

const page = document.body.dataset.page;
const protectedPage = ["portal", "canteen", "clubs", "lost-found", "my-orders", "canteen-staff"].includes(page);
const requestedRole = new URLSearchParams(window.location.search).get("role");
const savedRole = sessionStorage.getItem("campusRole") || localStorage.getItem("campusRole");
const role = requestedRole === "staff" || (!requestedRole && savedRole === "staff") ? "staff" : "student";
const roleName = role === "staff" ? "Faculty & staff" : "Student";
const roleLabel = document.querySelector("#login-role-name");
if (roleLabel) roleLabel.textContent = roleName;
const showError = (message) => {
  const error = document.querySelector("#login-error");
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
};

const clearCampusProfile = () => {
  ["campusRole", "campusName", "campusEmail", "campusPhone", "campusDemoAuth"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const runDemoAuth = () => {
  const demoAccounts = {
    student: {
      email: "student@dtc.edu.in",
      phone: "9999999991",
      name: "Demo Student"
    },
    staff: {
      email: "canteen@dtc.edu.in",
      phone: "9999999992",
      name: "Canteen Staff"
    }
  };
  const normalizePhone = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
    return digits;
  };

  if (page === "login") {
    const form = document.querySelector("#login-form");
    const loginFields = document.querySelector("#login-fields");
    const otpFields = document.querySelector("#otp-fields");
    const emailInput = document.querySelector("#college-email");
    const phoneInput = document.querySelector("#mobile-number");
    const otpInput = document.querySelector("#otp-code");
    const otpMessage = document.querySelector("#otp-message");
    const error = document.querySelector("#login-error");
    const roleChoices = [...document.querySelectorAll('input[name="role"]')];
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole === "student" || requestedRole === "staff") {
      const selectedRole = roleChoices.find((choice) => choice.value === requestedRole);
      if (selectedRole) selectedRole.checked = true;
    }

    let generatedOtp = "";
    let pendingAccount = null;
    const selectedRole = () => roleChoices.find((choice) => choice.checked)?.value || "student";
    const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));
    const showGeneratedOtp = () => {
      generatedOtp = createOtp();
      const label = document.createElement("span");
      label.textContent = "Your demo OTP is shown below. No SMS is sent.";
      const code = document.createElement("strong");
      code.className = "otp-demo-code";
      code.textContent = generatedOtp;
      otpMessage.replaceChildren(label, code);
      otpInput.value = "";
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      error.hidden = true;

      if (otpFields.hidden) {
        if (!emailInput.reportValidity() || !phoneInput.reportValidity()) return;
        const role = selectedRole();
        const account = demoAccounts[role];
        const email = emailInput.value.trim().toLowerCase();
        const phone = normalizePhone(phoneInput.value);
        if (email !== account.email || phone !== account.phone) {
          showError("Those details do not match the selected demo account. Use the example email and phone shown above.");
          return;
        }

        pendingAccount = { ...account, role };
        document.querySelector("#masked-mobile").textContent = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
        loginFields.hidden = true;
        otpFields.hidden = false;
        showGeneratedOtp();
        otpInput.focus();
        return;
      }

      if (!otpInput.reportValidity()) return;
      if (!pendingAccount || otpInput.value.trim() !== generatedOtp) {
        showError("That demo OTP is incorrect. Enter the code displayed above or generate a new one.");
        otpInput.select();
        return;
      }

      clearCampusProfile();
      sessionStorage.setItem("campusDemoAuth", "true");
      sessionStorage.setItem("campusRole", pendingAccount.role);
      sessionStorage.setItem("campusName", pendingAccount.name);
      sessionStorage.setItem("campusEmail", pendingAccount.email);
      sessionStorage.setItem("campusPhone", `+91${pendingAccount.phone}`);
      window.location.assign(pendingAccount.role === "staff" ? "canteen-staff.html" : "campus.html");
    });

    document.querySelector("#resend-code").addEventListener("click", showGeneratedOtp);
    document.querySelector("#change-phone").addEventListener("click", () => {
      pendingAccount = null;
      generatedOtp = "";
      otpFields.hidden = true;
      loginFields.hidden = false;
      error.hidden = true;
      emailInput.focus();
    });
  }

  if (protectedPage) {
    const demoAuthenticated = sessionStorage.getItem("campusDemoAuth") === "true";
    const savedRole = sessionStorage.getItem("campusRole");
    const staffPage = page === "canteen-staff";
    const correctRole = staffPage ? savedRole === "staff" : savedRole === "student";
    if (!demoAuthenticated || !correctRole) {
      if (demoAuthenticated && (savedRole === "staff" || savedRole === "student")) {
        window.location.replace(savedRole === "staff" ? "canteen-staff.html" : "campus.html");
      } else {
        clearCampusProfile();
        window.location.replace(`login.html?role=${staffPage ? "staff" : "student"}`);
      }
    }

    document.querySelector("#sign-out")?.addEventListener("click", (event) => {
      event.preventDefault();
      clearCampusProfile();
      window.location.assign("index.html");
    }, true);

    const email = sessionStorage.getItem("campusEmail") || localStorage.getItem("campusEmail");
    const emailLabel = document.querySelector("#dialog-email");
    if (emailLabel && email) {
      emailLabel.textContent = `${email} · demo`;
      emailLabel.hidden = false;
      document.querySelector("#dialog-email-label")?.removeAttribute("hidden");
    }
  }
};

if (document.body.dataset.authMode === "demo") {
  runDemoAuth();
} else if (!firebaseConfigReady) {
  if (protectedPage) {
    clearCampusProfile();
    window.location.replace(`login.html?role=${role}`);
  } else {
    showError("Firebase is not configured yet. Add your Firebase web app settings in firebase-config.js.");
    document.querySelector("#send-code")?.setAttribute("disabled", "");
    document.querySelector("#verify-code")?.setAttribute("disabled", "");
    document.querySelector("#resend-code")?.setAttribute("disabled", "");
    document.querySelector("#google-sign-in")?.setAttribute("disabled", "");
  }
} else {
  try {
  const [{ initializeApp }, {
    getAuth,
    getRedirectResult,
    onAuthStateChanged,
    RecaptchaVerifier,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signInWithPhoneNumber,
    signOut
  }] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  if (page === "login") {
    const form = document.querySelector("#login-form");
    const loginFields = document.querySelector("#login-fields");
    const otpFields = document.querySelector("#otp-fields");
    const phoneInput = document.querySelector("#mobile-number");
    const usernameInput = document.querySelector("#campus-username");
    const emailInput = document.querySelector("#college-email");
    const otpInput = document.querySelector("#otp-code");
    const otpMessage = document.querySelector("#otp-message");
    const submitButton = document.querySelector("#send-code");
    const googleButton = document.querySelector("#google-sign-in");
    const googleButtonLabel = document.querySelector("#google-sign-in-label");
    const verifyButton = document.querySelector("#verify-code");
    const resendButton = document.querySelector("#resend-code");
    let confirmationResult = null;
    let recaptchaVerifier = null;
    let recaptchaContainer = document.querySelector("#recaptcha-container");

    const setBusy = (busy, label) => {
      const activeButton = otpFields.hidden ? submitButton : verifyButton;
      activeButton.disabled = busy;
      resendButton.disabled = busy;
      if (label) activeButton.firstChild.textContent = `${label} `;
    };

    const resetRecaptcha = async () => {
      if (!recaptchaVerifier) return;
      await recaptchaVerifier.clear();
      recaptchaVerifier = null;
      const replacement = recaptchaContainer.cloneNode(false);
      recaptchaContainer.replaceWith(replacement);
      recaptchaContainer = replacement;
    };

    const getRecaptchaVerifier = () => {
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
          size: "invisible",
          "expired-callback": () => showError("Security check expired. Please request a new code.")
        });
      }
      return recaptchaVerifier;
    };

    const getPhoneNumber = () => {
      let digits = phoneInput.value.replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
      if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
      return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : "";
    };
    const maskPhoneNumber = (phone) => `${phone.slice(0, 4)}••••${phone.slice(-3)}`;
    const describeAuthError = (error) => {
      console.error("Firebase phone authentication failed.", error);
      const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const localHostTip = localHost
        ? " This site is running locally; deploy it to an authorized HTTPS domain for real SMS, or configure a Firebase test phone number."
        : "";
      const messages = {
        "auth/invalid-phone-number": "Firebase rejected this phone number. Check that it is a valid Indian mobile number and try again.",
        "auth/missing-phone-number": "Enter the phone number you want to verify.",
        "auth/invalid-verification-code": "That SMS code is incorrect. Check it and try again.",
        "auth/code-expired": "That SMS code expired. Request a new one.",
        "auth/too-many-requests": "Firebase temporarily blocked requests from this device or phone number. Wait before trying again.",
        "auth/quota-exceeded": "The Firebase SMS quota has been reached. Check the project's Authentication usage and billing.",
        "auth/captcha-check-failed": "Firebase's reCAPTCHA security check failed. Refresh and try again; verify this site is an authorized domain.",
        "auth/invalid-app-credential": `Firebase rejected the reCAPTCHA verification. Add this site's hostname under Authentication → Settings → Authorized domains, then reload.${localHostTip}`,
        "auth/missing-app-credential": "Firebase did not receive a reCAPTCHA verification. Refresh the page and try again.",
        "auth/operation-not-allowed": "Firebase rejected phone sign-in for project delhi-technical-campus-app. In that project's Firebase Console, open Authentication → Sign-in method → Phone, enable it, and save. If it is already enabled, confirm this web app belongs to that same project.",
        "auth/configuration-not-found": "Firebase Authentication is not set up for this project yet. In Firebase Console, open Authentication and choose Get started, then enable Phone under Sign-in method. Confirm the selected project is delhi-technical-campus-app and save the settings. If it is already enabled, make sure the Identity Toolkit API is enabled for the linked Google Cloud project.",
        "auth/unauthorized-domain": `This hostname (${window.location.hostname}) is not authorized by Firebase. For local testing, use http://localhost rather than 127.0.0.1. If this exact hostname still fails, add "${window.location.hostname}" under Authentication → Settings → Authorized domains in project delhi-technical-campus-app.${localHostTip}`,
        "auth/app-not-authorized": `This app is not authorized for Firebase phone authentication. Check the Firebase project and authorized domains.${localHostTip}`,
        "auth/billing-not-enabled": "Firebase requires billing to be enabled for phone SMS in this project. Check the project's billing plan and SMS settings.",
        "auth/invalid-api-key": "Firebase rejected the API key. Check that firebase-config.js uses the Web App config for this project.",
        "auth/network-request-failed": "Could not reach Firebase. Check your internet connection and try again."
      };
      const message = messages[error.code]
        || error.message
        || "Firebase returned no additional error details.";
      return `${message} [${error.code || "unknown Firebase error"}]`;
    };

    const finishGoogleSignIn = (user) => {
      localStorage.setItem("campusRole", role);
      localStorage.setItem("campusName", user.displayName || user.email || "Campus member");
      if (user.email) localStorage.setItem("campusEmail", user.email);
      else localStorage.removeItem("campusEmail");
      sessionStorage.removeItem("campusRole");
      window.location.assign("campus.html");
    };

    const describeGoogleError = (error) => {
      const messages = {
        "auth/operation-not-allowed": "Google sign-in is not enabled for Firebase project delhi-technical-campus-app. In Firebase Console, open Authentication → Sign-in method, enable Google, and save.",
        "auth/unauthorized-domain": `This hostname (${window.location.hostname}) is not authorized by Firebase. Add it under Authentication → Settings → Authorized domains in project delhi-technical-campus-app.`,
        "auth/popup-blocked": "The Google sign-in window was blocked by your browser. Allow pop-ups for this site and try again.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled before it completed.",
        "auth/network-request-failed": "Could not reach Firebase. Check your internet connection and try again."
      };
      return `${messages[error.code] || error.message || "Google sign-in failed. Please try again."} [${error.code || "unknown Firebase error"}]`;
    };

    getRedirectResult(auth).then((result) => {
      if (result) finishGoogleSignIn(result.user);
    }).catch((error) => {
      console.error("Firebase Google redirect authentication failed.", error);
      showError(describeGoogleError(error));
    });

    const signInWithGoogle = async () => {
      document.querySelector("#login-error").hidden = true;
      googleButton.disabled = true;
      googleButton.setAttribute("aria-busy", "true");
      googleButtonLabel.textContent = "Connecting to Google…";
      sessionStorage.setItem("campusRole", role);
      try {
        const credential = await signInWithPopup(auth, new GoogleAuthProvider());
        finishGoogleSignIn(credential.user);
      } catch (error) {
        console.error("Firebase Google authentication failed.", error);
        if (error.code === "auth/popup-blocked") {
          googleButtonLabel.textContent = "Redirecting to Google…";
          try {
            await signInWithRedirect(auth, new GoogleAuthProvider());
            return;
          } catch (redirectError) {
            console.error("Firebase Google redirect authentication could not start.", redirectError);
            error = redirectError;
          }
        }
        showError(describeGoogleError(error));
        sessionStorage.removeItem("campusRole");
        googleButtonLabel.textContent = "Continue with Google";
        googleButton.disabled = false;
        googleButton.removeAttribute("aria-busy");
      }
    };

    googleButton.addEventListener("click", signInWithGoogle);

    const requestSmsCode = async () => {
      const phoneNumber = getPhoneNumber();
      if (!phoneNumber) {
        showError("Enter a valid 10-digit Indian mobile number. The +91 country code is already added.");
        phoneInput.focus();
        return;
      }

      document.querySelector("#login-error").hidden = true;
      setBusy(true, "Sending…");
      try {
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, getRecaptchaVerifier());
        document.querySelector("#masked-mobile").textContent = maskPhoneNumber(phoneNumber);
        otpMessage.textContent = "A verification code was sent by SMS. Carrier message rates may apply.";
        loginFields.hidden = true;
        otpFields.hidden = false;
        otpInput.value = "";
        otpInput.focus();
        submitButton.firstChild.textContent = "Continue with phone OTP ";
        setBusy(false, "Verify & enter campus");
      } catch (error) {
        showError(describeAuthError(error));
        setBusy(false, otpFields.hidden ? "Continue with phone OTP" : "Verify & enter campus");
        try {
          await resetRecaptcha();
        } catch (resetError) {
          console.error("Firebase reCAPTCHA could not be reset.", resetError);
        }
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (otpFields.hidden) {
        if (!usernameInput.reportValidity() || !emailInput.reportValidity()) return;
        await requestSmsCode();
        return;
      }

      if (!otpInput.reportValidity() || !confirmationResult) return;
      document.querySelector("#login-error").hidden = true;
      setBusy(true, "Verifying…");
      try {
        const credential = await confirmationResult.confirm(otpInput.value.trim());
        const displayName = usernameInput.value.trim();
        localStorage.setItem("campusRole", role);
        localStorage.setItem("campusName", displayName || credential.user.phoneNumber);
        if (emailInput.value.trim()) localStorage.setItem("campusEmail", emailInput.value.trim());
        else localStorage.removeItem("campusEmail");
        window.location.assign("campus.html");
      } catch (error) {
        showError(describeAuthError(error));
        setBusy(false, "Verify & enter campus");
        if (error.code === "auth/code-expired") {
          confirmationResult = null;
          try {
            await resetRecaptcha();
          } catch (resetError) {
            console.error("Firebase reCAPTCHA could not be reset.", resetError);
          }
          otpFields.hidden = true;
          loginFields.hidden = false;
          submitButton.firstChild.textContent = "Continue with phone OTP ";
          phoneInput.focus();
        } else {
          otpInput.select();
        }
      }
    });

    resendButton.addEventListener("click", requestSmsCode);
    document.querySelector("#change-phone").addEventListener("click", async () => {
      confirmationResult = null;
      otpFields.hidden = true;
      loginFields.hidden = false;
      document.querySelector("#login-error").hidden = true;
      submitButton.firstChild.textContent = "Continue with phone OTP ";
      try {
        await resetRecaptcha();
      } catch (error) {
        console.error("Firebase reCAPTCHA could not be reset.", error);
        showError("The security check could not be reset. Refresh the page and try again.");
      }
      phoneInput.focus();
    });
  }

  if (protectedPage) {
    onAuthStateChanged(auth, (user) => {
      const supportedProvider = user?.providerData.some((provider) =>
        provider.providerId === "phone" || provider.providerId === "google.com"
      );
      if (!user || !supportedProvider) {
        clearCampusProfile();
        window.location.replace(`login.html?role=${role}`);
      }
    }, (error) => {
      console.error("Firebase authentication state could not be checked.", error);
      clearCampusProfile();
      window.location.replace(`login.html?role=${role}`);
    });

    document.querySelector("#sign-out")?.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await signOut(auth);
        clearCampusProfile();
        window.location.assign("index.html");
      } catch (error) {
        console.error("Firebase sign-out failed.", error);
        showError("Sign out failed. Please try again.");
      }
    }, true);

    const email = localStorage.getItem("campusEmail");
    const emailLabel = document.querySelector("#dialog-email");
    if (emailLabel && email) {
      emailLabel.textContent = `${email} · not verified`;
      emailLabel.hidden = false;
      document.querySelector("#dialog-email-label")?.removeAttribute("hidden");
    }
  }
  } catch (error) {
    console.error("Firebase Authentication could not be initialized.", error);
    if (protectedPage) {
      clearCampusProfile();
      window.location.replace(`login.html?role=${role}`);
    } else {
      showError("Firebase Authentication could not start. Check your web app configuration and internet connection.");
      document.querySelector("#send-code")?.setAttribute("disabled", "");
      document.querySelector("#verify-code")?.setAttribute("disabled", "");
      document.querySelector("#resend-code")?.setAttribute("disabled", "");
      document.querySelector("#google-sign-in")?.setAttribute("disabled", "");
    }
  }
}
