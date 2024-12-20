export const environment = {
    production: true,
    firebaseConfig: {
        apiKey: "AIzaSyAR25aA7XOEdHqSarp22t2jJKSkjFYSOpA",
        authDomain: "gladioforceauth.firebaseapp.com",
        projectId: "gladioforceauth",
        storageBucket: "gladioforceauth.firebasestorage.app",
        messagingSenderId: "275933662041",
        appId: "1:275933662041:web:98e8406239336d53141a48"
    },
    apiUrl: 'http://localhost:8000/api'
};

// We should still make a new firebase application for this production environment
// Also a different apiUrl once in the hosted environment?