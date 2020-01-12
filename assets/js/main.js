const serviceWorkerLocation = "service-worker.js";
// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    registerServiceWorker();
} else {
    console.log("ServiceWorker belum didukung browser ini.");
}

function registerServiceWorker() {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register(serviceWorkerLocation)
            .then(function (registration) {
                if (registration.active) requestPermission();
                return registration;
            })
            .then(function () {
                console.log("Pendaftaran ServiceWorker berhasil");
            })
            .catch(function () {
                console.log("Pendaftaran ServiceWorker gagal");
            });
    });
}

function requestPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function (result) {
            if (result === "denied") {
                console.log("Fitur notifikasi tidak diijinkan.");
                return;
            } else if (result === "default") {
                console.error("Pengguna menutup kotak dialog permintaan ijin.");
                return;
            }

            if (('PushManager' in window)) {
                navigator.serviceWorker.getRegistration().then(function (registration) {
                    registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array('BPsL0wOI2aY1QMVslmLmC-q3pZiovUs1zEjUW6la7oxS72S8v5M-Z38w3WaXlxjGJGGRr2jmbFM-mhYqbhQp5m4')
                    }).then(function (subscribe) {
                        console.log('Berhasil melakukan subscribe dengan endpoint: ', subscribe.endpoint);
                        console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(
                            null, new Uint8Array(subscribe.getKey('p256dh')))));
                        console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(
                            null, new Uint8Array(subscribe.getKey('auth')))));
                    }).catch(function (e) {
                        console.error('Tidak dapat melakukan subscribe ', e.message);
                    });
                });
            }
        });
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const addFavoriteTeam = (team) => (event) => {
    event.stopPropagation();
    saveTeamAsFavorite(team)
        .then(updateAndCheckSavedTeams)
        .then(() => {
            M.toast({html: `${team.name} saved successfully 🎉`})
        });
};

const removeFavoriteTeam = (code, team) => (event) => {
    event.stopPropagation();
    deleteFavoriteTeam(team.id)
        .then(() => {
            loadPage(code);
            M.toast({html: `${team.name} is not in your favorite anymore`})
        });
};

const addFavoriteMatch = (match) => (event) => {
    event.stopPropagation();
    saveMatchAsFavorite(match)
        .then(updateAndCheckSavedMatches)
        .then(() => {
            M.toast({html: 'This match saved successfully 🎉'})
        });
};

const removeFavoriteMatch = (code, matchId) => (event) => {
    event.stopPropagation();
    deleteFavoriteMatch(matchId)
        .then(() => {
            loadPage(code);
            M.toast({html: 'The match was not in your favorite list again'})
        });
};
