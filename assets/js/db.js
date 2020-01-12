const databaseName = "galibola";
const databaseVersion = 2;
const teamObjectStore = "team";
const matchObjectStore = "match";

let dbPromised = idb.open(databaseName, databaseVersion, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
        case 0:
            upgradeDb.createObjectStore(teamObjectStore, {
                keyPath: "id"
            });
            upgradeDb.createObjectStore(matchObjectStore, {
                keyPath: "id"
            });
        case 1:
            let teamOS = upgradeDb.transaction.objectStore(teamObjectStore);
            teamOS.createIndex("name", "name", {unique: false});
    }
});

function saveTeamAsFavorite(team) {
    return dbPromised
        .then(function(db) {
            let tx = db.transaction(teamObjectStore, "readwrite");
            let store = tx.objectStore(teamObjectStore);
            store.add(team);
            return tx.complete;
        })
        .then(function() {
            console.log('Team berhasil disimpan.');
        }).catch(function() {
            console.log('Team gagal disimpan.')
        });
}

function saveMatchAsFavorite(team) {
    return dbPromised
        .then(function(db) {
            let tx = db.transaction(matchObjectStore, "readwrite");
            let store = tx.objectStore(matchObjectStore);
            store.add(team);
            return tx.complete;
        })
        .then(function() {
            console.log('Match berhasil disimpan.');
        }).catch(function() {
            console.log('Match gagal disimpan.')
        });
}

function loadFavoriteTeams(observer) {
    return dbPromised.then(function(db) {
        let tx = db.transaction(teamObjectStore, 'readonly');
        let store = tx.objectStore(teamObjectStore);
        return store.getAll();
    }).then(function(teams) {
        observer(teams);
    }).catch((error) => {
        console.log('Error : ' + error);
    });
}

function loadFavoriteMatches(observer) {
    return dbPromised.then(function(db) {
        let tx = db.transaction(matchObjectStore, 'readonly');
        let store = tx.objectStore(matchObjectStore);
        return store.getAll();
    }).then(function(matches) {
        observer(matches);
    }).catch((error) => {
        console.log('Error : ' + error);
    });
}

function deleteFavoriteTeam(teamId) {
    return dbPromised.then(function(db) {
        let tx = db.transaction(teamObjectStore, 'readwrite');
        let store = tx.objectStore(teamObjectStore);
        store.delete(teamId);
        return tx.complete;
    }).then(function() {
        console.log('Item deleted');
    });
}

function deleteFavoriteMatch(matchId) {
    return dbPromised.then(function(db) {
        let tx = db.transaction(matchObjectStore, 'readwrite');
        let store = tx.objectStore(matchObjectStore);
        store.delete(matchId);
        return tx.complete;
    }).then(function() {
        console.log('Item deleted');
    });
}

