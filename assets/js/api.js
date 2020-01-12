const baseUrl = "https://api.football-data.org";

const getTeamUrl = (competitionId) => baseUrl + "/v2/competitions/" + competitionId + "/teams";

const getMatchesUrl = (teamId) => baseUrl + "/v2/teams/" + teamId + "/matches/";

const defaultHeader = new Headers({
    'X-Auth-Token': token,
});

const checkResponse = (response) => {
    if (response.status !== 200) {
        console.log('Error : ' + response.status);
        return Promise.reject(new Error(response.statusText));
    } else {
        return Promise.resolve(response);
    }
};

const convertToJson = (response) => response.json();

const handleError = (error) => {
    console.log('Error : ' + error);
};


const fetchJson = (url, jsonDataHandler, errorHandler) => {
    return fetch(url, {headers: defaultHeader})
        .then(checkResponse)
        .then(convertToJson)
        .then(jsonDataHandler)
        .catch((error) => {
            if ('caches' in window) {
                caches.match(url)
                    .then(function (response) {
                        if (!response) throw Error("Response is null");
                        return response;
                    })
                    .then(convertToJson)
                    .then(jsonDataHandler)
                    .catch(errorHandler);
            } else handleError(error);
        });
};

const getTeamsByCompetitionId = (competitionId, observer, onError) => {
    return fetchJson(getTeamUrl(competitionId), observer, onError);
};

const getMatchesByTeamId = (teamId, observer, onError) => {
    return fetchJson(getMatchesUrl(teamId), observer, onError)
};
