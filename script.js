import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5XfoW34VtLI5Zo9F-Xqdx745-58JqQ4U",
  authDomain: "diet-325aa.firebaseapp.com",
  projectId: "diet-325aa",
  storageBucket: "diet-325aa.firebasestorage.app",
  messagingSenderId: "365937326551",
  appId: "1:365937326551:web:226ed9970bd668bf1f7392",
  measurementId: "G-9782HN46W9"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Firebase 연결 성공");

import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const auth = getAuth(app);

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const email =
        username + "@diet.local";

    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("회원가입 성공!");

    }
    catch(error) {

        alert(error.message);

    }

});

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const loginBtn =
    document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const email =
        username + "@diet.local";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = auth.currentUser;

        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        document.querySelector(".login-box").style.display = "none";

            if (!userDoc.exists()) {

                document.getElementById("startWeightBox").style.display = "block";

            }
            else {

                document.getElementById("weightBox").style.display = "block";

            }

            loadRanking();


    }
    catch(error) {

        alert("로그인 실패");

    }

});

const saveStartWeightBtn =
    document.getElementById("saveStartWeightBtn");

saveStartWeightBtn.addEventListener(
    "click",
    async () => {

        const user = auth.currentUser;

        const startWeight =
            parseFloat(
                document.getElementById(
                    "startWeightInput"
                ).value
            );

        const username =
            document.getElementById(
                "username"
            ).value;

        await setDoc(
            doc(db, "users", user.uid),
            {
                username: username,
                startWeight: startWeight
            }
);

        alert("시작 체중 저장 완료");

        loadRanking();

    }
);

const saveWeightBtn =
    document.getElementById("saveWeightBtn");

saveWeightBtn.addEventListener(
    "click",
    async () => {

        const user = auth.currentUser;

        const weight =
            parseFloat(
                document.getElementById(
                    "weightInput"
                ).value
            );

        const now =
            new Date();

        const key =
            Date.now().toString();

        try {

            await setDoc(
                doc(
                    db,
                    "weights",
                    user.uid
                ),
                {
                    [key]: weight
                },
                {
                    merge: true
                }
            );

            alert("체중 저장 완료");

            loadRanking();

        }
        catch(error) {

            console.error(error);

        }

    }
);

const startDate =
    new Date("2026-06-17");

const today =
    new Date();

const diffTime =
    today - startDate;

const diffDays =
    Math.floor(
        diffTime /
        (1000 * 60 * 60 * 24)
    ) + 1;

document.getElementById(
    "dayCounter"
).textContent =
    diffDays + "일차";


async function loadRanking() {

    const usersSnapshot =
        await getDocs(
            collection(db, "users")
        );

    const ranking = [];

    for (const userDoc of usersSnapshot.docs) {

        const userData = userDoc.data();

        const weightDoc =
            await getDoc(
                doc(db, "weights", userDoc.id)
            );

        if (!weightDoc.exists()) continue;

        const weights =
            weightDoc.data();

        const latestKey =
            Object.keys(weights)
            .sort()
            .pop();

        const latestWeight =
            weights[latestKey];

        const percent =
            (
                (userData.startWeight - latestWeight)
                / 8
            ) * 100;

        ranking.push({
            username:
                userData.username ??
                userDoc.id.substring(0,5),

            percent:
                Math.max(
                    0,
                    percent
                )
        });
    }

    ranking.sort(
        (a,b) =>
            b.percent - a.percent
    );

    const container =
        document.getElementById(
            "rankingContainer"
        );

    container.innerHTML = "";

    ranking.forEach(
        (user,index) => {

            container.innerHTML += `
            <div class="member">

                <div class="profile">
                    ${index + 1}
                </div>

                <div class="member-info">

                    <div class="name-row">

                        <span>
                            ${user.username}
                        </span>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="
                            width:
                            ${Math.min(
                                user.percent,
                                100
                            )}%">
                        </div>

                    </div>

                    <p class="percent">
                        ${user.percent.toFixed(1)}%
                    </p>

                </div>

            </div>
            `;
        }
    );
}

loadRanking();