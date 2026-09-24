// ===============================
// LIFEOS - SCRIPT.JS
// ===============================

const API_BASE = "https://lifeos-backend-vqcp.onrender.com";

let tasks = [];
let attendanceRecords = [];
let expenseRecords = [];

let timerInterval = null;
let timeLeft = 25 * 60;

let taskChart = null;
let attendanceChart = null;
let expenseChart = null;


// ===============================
// LOGIN / REGISTER
// ===============================

function showRegister() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}


// ===============================
// REGISTER
// ===============================

async function registerUser() {

    const username =
        document.getElementById("registerUsername").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const message =
        document.getElementById("registerMessage");

    if (!username || !password) {
        message.textContent =
            "Please enter username and password.";
        return;
    }

    try {

        const response = await fetch(
            API_BASE + "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            message.textContent =
                result.message || "Registration failed.";
            return;
        }

        message.textContent =
            "Registration successful! You can now login.";

        document.getElementById("registerUsername").value = "";
        document.getElementById("registerPassword").value = "";

        setTimeout(function () {
            showLogin();
        }, 1000);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";
    }
}


// ===============================
// LOGIN
// ===============================

async function loginUser() {

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");

    if (!username || !password) {
        message.textContent =
            "Please enter username and password.";
        return;
    }

    try {

        const response = await fetch(
            API_BASE + "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const result = await response.json();

        if (result.message === "Login successful") {

            message.textContent =
                "Login successful!";

            localStorage.setItem(
                "lifeosUser",
                username
            );

            setTimeout(function () {
                openApplication();
            }, 500);

        } else {

            message.textContent =
                result.message ||
                "Invalid username or password.";
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";
    }
}


// ===============================
// OPEN APPLICATION
// ===============================

function openApplication() {

    document.getElementById("authScreen").style.display = "none";

    document.getElementById("app").style.display = "block";

    showSection("dashboard");

    loadTasks();
    loadAttendance();
    loadExpenses();

    updateTimerDisplay();
}


// ===============================
// LOGOUT
// ===============================

function logoutUser() {

    localStorage.removeItem("lifeosUser");

    document.getElementById("app").style.display = "none";

    document.getElementById("authScreen").style.display = "flex";

    showLogin();
}


// ===============================
// SECTION SWITCHING
// ===============================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(function (section) {
        section.style.display = "none";
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.style.display = "block";
    }

    if (sectionId === "analytics") {
        updateCharts();
    }
}


// ===============================
// TASK MANAGER
// ===============================

async function loadTasks() {

    try {

        const response =
            await fetch(
                API_BASE + "/api/tasks/" +
                localStorage.getItem("lifeosUser")
            );

        tasks = await response.json();

        displayTasks();
        updateDashboard();

    } catch (error) {

        console.error(
            "Task loading error:",
            error
        );
    }
}


async function addTask() {

    const input =
        document.getElementById("taskInput");

    const title =
        input.value.trim();

    if (!title) {

        alert("Please enter a task.");
        return;
    }

    try {

        const response =
            await fetch(
                API_BASE + "/api/tasks/" +
                localStorage.getItem("lifeosUser"),
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: title,
                        completed: false
                    })
                }
            );

        const task =
            await response.json();

        tasks.push(task);

        input.value = "";

        displayTasks();
        updateDashboard();

    } catch (error) {

        console.error(
            "Task error:",
            error
        );

        alert("Unable to add task.");
    }
}


function displayTasks() {

    const list =
        document.getElementById("taskList");

    if (!list) return;

    list.innerHTML = "";

    tasks.forEach(function (task) {

        const li =
            document.createElement("li");

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked =
            task.completed;

        checkbox.addEventListener(
            "change",
            function () {
                toggleTask(task.id);
            }
        );

        const span =
            document.createElement("span");

        span.textContent =
            task.title;

        if (task.completed) {
            span.style.textDecoration =
                "line-through";
        }

        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "Delete";

        deleteButton.onclick =
            function () {
                deleteTask(task.id);
            };

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        list.appendChild(li);
    });

    updateScore();
}


async function toggleTask(id) {

    const task =
        tasks.find(function (t) {
            return t.id === id;
        });

    if (!task) return;

    task.completed =
        !task.completed;

    try {

        await fetch(
            API_BASE + "/api/tasks/" +
            localStorage.getItem("lifeosUser") +
            "/" + id,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(task)
            }
        );

        displayTasks();
        updateDashboard();

    } catch (error) {

        console.error(
            "Task update error:",
            error
        );
    }
}


async function deleteTask(id) {

    try {

        await fetch(
            API_BASE + "/api/tasks/" +
            localStorage.getItem("lifeosUser") +
            "/" + id,
            {
                method: "DELETE"
            }
        );

        tasks =
            tasks.filter(function (task) {
                return task.id !== id;
            });

        displayTasks();
        updateDashboard();

    } catch (error) {

        console.error(
            "Task delete error:",
            error
        );
    }
}


function updateScore() {

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    console.log(
        "Completed Tasks: " + completed
    );
}


// ===============================
// ATTENDANCE
// ===============================

async function loadAttendance() {

    try {

        const response =
            await fetch(
                API_BASE + "/api/attendance"
            );

        attendanceRecords =
            await response.json();

        displayAttendance();
        updateDashboard();

    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );
    }
}


async function addAttendance() {

    const subject =
        document
            .getElementById("subjectInput")
            .value
            .trim();

    const totalClasses =
        Number(
            document.getElementById(
                "totalClassesInput"
            ).value
        );

    const attendedClasses =
        Number(
            document.getElementById(
                "attendedClassesInput"
            ).value
        );

    if (
        !subject ||
        totalClasses <= 0 ||
        attendedClasses < 0 ||
        attendedClasses > totalClasses
    ) {

        alert(
            "Please enter valid attendance details."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_BASE + "/api/attendance",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        subject: subject,
                        totalClasses: totalClasses,
                        attendedClasses:
                            attendedClasses
                    })
                }
            );

        const record =
            await response.json();

        attendanceRecords.push(record);

        document.getElementById(
            "subjectInput"
        ).value = "";

        document.getElementById(
            "totalClassesInput"
        ).value = "";

        document.getElementById(
            "attendedClassesInput"
        ).value = "";

        displayAttendance();
        updateDashboard();

    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );
    }
}


function displayAttendance() {

    const container =
        document.getElementById(
            "attendanceList"
        );

    if (!container) return;

    container.innerHTML = "";

    attendanceRecords.forEach(
        function (record) {

            const percentage =
                (
                    record.attendedClasses /
                    record.totalClasses
                ) * 100;

            const card =
                document.createElement("div");

            card.className =
                "attendance-card";

            const title =
                document.createElement("h3");

            title.textContent =
                record.subject;

            const total =
                document.createElement("p");

            total.textContent =
                "Total Classes: " +
                record.totalClasses;

            const attended =
                document.createElement("p");

            attended.textContent =
                "Attended: " +
                record.attendedClasses;

            const percent =
                document.createElement("p");

            percent.textContent =
                "Attendance: " +
                percentage.toFixed(1) +
                "%";

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.onclick =
                function () {
                    deleteAttendance(
                        record.id
                    );
                };

            card.appendChild(title);
            card.appendChild(total);
            card.appendChild(attended);
            card.appendChild(percent);
            card.appendChild(deleteButton);

            if (percentage < 75) {

                const warning =
                    document.createElement("p");

                warning.textContent =
                    "⚠️ Attendance shortage! You need to attend more classes.";

                card.appendChild(warning);
            }

            container.appendChild(card);
        }
    );
}


async function deleteAttendance(id) {

    try {

        await fetch(
            API_BASE +
            "/api/attendance/" +
            id,
            {
                method: "DELETE"
            }
        );

        attendanceRecords =
            attendanceRecords.filter(
                function (record) {
                    return record.id !== id;
                }
            );

        displayAttendance();
        updateDashboard();

    } catch (error) {

        console.error(
            "Attendance delete error:",
            error
        );
    }
}


// ===============================
// STUDY TIMER
// ===============================

function updateTimerDisplay() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    const timer =
        document.getElementById("timer");

    if (timer) {

        timer.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }

    const dashboardTimer =
        document.getElementById(
            "dashboardStudy"
        );

    if (dashboardTimer) {

        dashboardTimer.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }
}


function startTimer() {

    if (timerInterval) return;

    timerInterval =
        setInterval(function () {

            if (timeLeft > 0) {

                timeLeft--;

                updateTimerDisplay();

            } else {

                clearInterval(
                    timerInterval
                );

                timerInterval = null;

                alert(
                    "🎉 Study session completed!"
                );
            }

        }, 1000);
}


function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;
}


function resetTimer() {

    stopTimer();

    timeLeft = 25 * 60;

    updateTimerDisplay();
}


// ===============================
// EXPENSE TRACKER
// ===============================

async function loadExpenses() {

    try {

        const response =
            await fetch(
                API_BASE + "/api/expenses"
            );

        expenseRecords =
            await response.json();

        displayExpenses();
        updateDashboard();

    } catch (error) {

        console.error(
            "Expense loading error:",
            error
        );
    }
}


async function addExpense() {

    const title =
        document
            .getElementById(
                "expenseTitleInput"
            )
            .value
            .trim();

    const amount =
        Number(
            document.getElementById(
                "expenseInput"
            ).value
        );

    if (!title || amount <= 0) {

        alert(
            "Please enter a valid expense."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API_BASE + "/api/expenses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title: title,
                        amount: amount
                    })
                }
            );

        const expense =
            await response.json();

        expenseRecords.push(expense);

        document.getElementById(
            "expenseTitleInput"
        ).value = "";

        document.getElementById(
            "expenseInput"
        ).value = "";

        displayExpenses();
        updateDashboard();

    } catch (error) {

        console.error(
            "Expense error:",
            error
        );
    }
}


function displayExpenses() {

    const list =
        document.getElementById(
            "expenseList"
        );

    if (!list) return;

    list.innerHTML = "";

    let total = 0;

    expenseRecords.forEach(
        function (expense) {

            total += expense.amount;

            const card =
                document.createElement("div");

            card.className =
                "expense-card";

            const title =
                document.createElement("h3");

            title.textContent =
                expense.title;

            const amount =
                document.createElement("p");

            amount.textContent =
                "₹" +
                expense.amount.toFixed(2);

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.onclick =
                function () {
                    deleteExpense(
                        expense.id
                    );
                };

            card.appendChild(title);
            card.appendChild(amount);
            card.appendChild(deleteButton);

            list.appendChild(card);
        }
    );

    const totalElement =
        document.getElementById(
            "totalExpense"
        );

    if (totalElement) {

        totalElement.textContent =
            "₹" +
            total.toFixed(2);
    }
}


async function deleteExpense(id) {

    try {

        await fetch(
            API_BASE +
            "/api/expenses/" +
            id,
            {
                method: "DELETE"
            }
        );

        expenseRecords =
            expenseRecords.filter(
                function (expense) {
                    return expense.id !== id;
                }
            );

        displayExpenses();
        updateDashboard();

    } catch (error) {

        console.error(
            "Expense delete error:",
            error
        );
    }
}
// ===============================
// SMART RECOMMENDATION
// ===============================

function generateRecommendation() {

    const recommendation =
        document.getElementById(
            "recommendation"
        );

    if (!recommendation) return;

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    const pending =
        tasks.length - completed;

    let message;

    if (attendanceRecords.length > 0) {

        const total =
            attendanceRecords.reduce(
                function (sum, record) {
                    return sum +
                        record.totalClasses;
                },
                0
            );

        const attended =
            attendanceRecords.reduce(
                function (sum, record) {
                    return sum +
                        record.attendedClasses;
                },
                0
            );

        const attendance =
            (attended / total) * 100;

        if (attendance < 75) {

            message =
                "📚 Focus on attendance. Try to attend your upcoming classes.";

        } else if (pending > 0) {

            message =
                "✅ You have " +
                pending +
                " pending task(s). Complete one before starting another.";

        } else {

            message =
                "🔥 Great work! Your tasks and attendance are looking good.";
        }

    } else if (pending > 0) {

        message =
            "🎯 You have " +
            pending +
            " pending task(s). Start with the most important one.";

    } else {

        message =
            "🚀 Add some tasks and attendance data so LifeOS can guide you.";
    }

    recommendation.textContent =
        message;
}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    const dashboardTasks =
        document.getElementById(
            "dashboardTasks"
        );

    if (dashboardTasks) {

        dashboardTasks.textContent =
            completed;
    }

    const dashboardAttendance =
        document.getElementById(
            "dashboardAttendance"
        );

    if (attendanceRecords.length > 0) {

        const total =
            attendanceRecords.reduce(
                function (sum, record) {
                    return sum +
                        record.totalClasses;
                },
                0
            );

        const attended =
            attendanceRecords.reduce(
                function (sum, record) {
                    return sum +
                        record.attendedClasses;
                },
                0
            );

        const average =
            (attended / total) * 100;

        if (dashboardAttendance) {

            dashboardAttendance.textContent =
                average.toFixed(1) +
                "%";
        }

    } else {

        if (dashboardAttendance) {

            dashboardAttendance.textContent =
                "0%";
        }
    }

    const totalExpense =
        expenseRecords.reduce(
            function (sum, expense) {
                return sum +
                    expense.amount;
            },
            0
        );

    const dashboardExpense =
        document.getElementById(
            "dashboardExpense"
        );

    if (dashboardExpense) {

        dashboardExpense.textContent =
            "₹" +
            totalExpense.toFixed(2);
    }

    generateRecommendation();
}


// ===============================
// ANALYTICS
// ===============================

function updateCharts() {

    if (typeof Chart === "undefined") {

        console.log(
            "Chart.js is not loaded."
        );

        return;
    }

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    const pending =
        tasks.length - completed;

    const taskCanvas =
        document.getElementById(
            "taskChart"
        );

    if (taskCanvas) {

        if (taskChart) {
            taskChart.destroy();
        }

        taskChart =
            new Chart(
                taskCanvas,
                {
                    type: "doughnut",

                    data: {

                        labels: [
                            "Completed",
                            "Pending"
                        ],

                        datasets: [
                            {
                                data: [
                                    completed,
                                    pending
                                ]
                            }
                        ]
                    }
                }
            );
    }


    const attendanceCanvas =
        document.getElementById(
            "attendanceChart"
        );

    if (attendanceCanvas) {

        if (attendanceChart) {
            attendanceChart.destroy();
        }

        const subjects =
            attendanceRecords.map(
                function (record) {
                    return record.subject;
                }
            );

        const percentages =
            attendanceRecords.map(
                function (record) {

                    return (
                        record.attendedClasses /
                        record.totalClasses
                    ) * 100;
                }
            );

        attendanceChart =
            new Chart(
                attendanceCanvas,
                {
                    type: "bar",

                    data: {

                        labels: subjects,

                        datasets: [
                            {
                                label:
                                    "Attendance %",
                                data:
                                    percentages
                            }
                        ]
                    },

                    options: {

                        scales: {

                            y: {

                                beginAtZero:
                                    true,

                                max: 100
                            }
                        }
                    }
                }
            );
    }


    const expenseCanvas =
        document.getElementById(
            "expenseChart"
        );

    if (expenseCanvas) {

        if (expenseChart) {
            expenseChart.destroy();
        }

        const titles =
            expenseRecords.map(
                function (expense) {
                    return expense.title;
                }
            );

        const amounts =
            expenseRecords.map(
                function (expense) {
                    return expense.amount;
                }
            );

        expenseChart =
            new Chart(
                expenseCanvas,
                {
                    type: "pie",

                    data: {

                        labels: titles,

                        datasets: [
                            {
                                data: amounts
                            }
                        ]
                    }
                }
            );
    }
}


// ===============================
// INITIALIZATION
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateTimerDisplay();

        const savedUser =
            localStorage.getItem(
                "lifeosUser"
            );

        if (savedUser) {

            openApplication();

        } else {

            const authScreen =
                document.getElementById(
                    "authScreen"
                );

            const app =
                document.getElementById(
                    "app"
                );

            if (authScreen) {
                authScreen.style.display =
                    "flex";
            }

            if (app) {
                app.style.display =
                    "none";
            }
        }
    }
);