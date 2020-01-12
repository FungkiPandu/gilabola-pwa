let sidenav = $('.sidenav');

let code;

$(document).ready(function () {
    M.Sidenav.init(sidenav);
    hideLoading();

    // Load competitionId content
    code = window.location.hash.substr(1);

    loadNav();
    loadPage(code);
});


function loadNav() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status !== 200) return;

            // Muat daftar tautan menu
            sidenav.append(xhttp.responseText);

            setSelectedSideNav(code);

            // Daftarkan event listener untuk setiap tautan menu
            document.querySelectorAll('.sidenav a')
                .forEach(function (elm) {
                    elm.addEventListener('click', function (event) {
                        if (window.screen.width < 992) {
                            M.Sidenav.getInstance(sidenav).close();
                        }

                        // Muat konten halaman yang dipanggil
                        code = event.target.getAttribute('href').substr(1);
                        loadPage(code);
                    });
                });
        }
    };
    xhttp.open("GET", 'navigation.html', true);
    xhttp.send();
}

function setSelectedSideNav(code) {
    $(".active").removeClass("active");
    $(`a[href='#${code}']`).parent().addClass('active');
}

function loadPage(competitionId) {
    // don't load any competitionId on index, let it with welcoming screen
    if (competitionId === '') {
        // $('#team-container').html("");
        hideLoading();
        return;
    }

    setSelectedSideNav(competitionId);
    showLoading();

    // load favorite teams
    if (competitionId === 'favoriteTeams') {
        $('.brand-logo').html("Favorite Teams");
        loadSavedTeamPage();
    } else if (competitionId === 'favoriteMatches') {
        $('.brand-logo').html("Favorite Matches");
        loadSavedMatchPage();
    } else if (competitionId.substr(0, 4) === 'team') {
        gotoMatchPage(competitionId.substr(4));
    } else {
        loadCompetitionPage(competitionId);
    }
}

function loadCompetitionPage(competitionId) {
    getTeamsByCompetitionId(competitionId, (json) => {
        console.log(json);

        // change title
        let title = json.competition.name;
        $('.brand-logo').html(title);

        $('#team-container').html("");
        json.teams.forEach((team) => {
            let teamNode = parseAndCreateTeamNode(team);
            $('#team-container').append(teamNode);
        });
    }, showErrorView)
        .then(updateAndCheckSavedTeams)
        .then(hideLoading);
}

function showErrorView() {
    $('.brand-logo').html('Oh no!');
    const container = $('#team-container');
    container.html('');
    const errorView = $('.fetch-error').clone();
    container.append(errorView);
}

function showLoading() {
    $('.progress').show();
}

function hideLoading() {
    $('.progress').hide();
}

function updateAndCheckSavedTeams() {
    loadFavoriteTeams((teams) => {
        teams.forEach((team) => {
            let teamNode = $('#' + team.id);
            if (teamNode.length > 0) {
                teamNode = setAsFavoriteButton(teamNode);
                teamNode.find(".btn-floating")[0]
                    .addEventListener('click', removeFavoriteTeam(code, team));
            }
        });
    })
}

function loadSavedTeamPage() {
    loadFavoriteTeams((data) => {
        $('#team-container').html("");
        console.log(data);

        if (data.length === 0) {
            showEmptyText();
            return;
        }

        data.forEach((team) => {
            let teamNode = parseAndCreateTeamNode(team);
            $('#team-container').append(teamNode);
        });
    })
        .then(updateAndCheckSavedTeams)
        .then(hideLoading);
}

function parseAndCreateTeamNode(team) {
    const {id, tla, name, venue, website, crestUrl} = team;
    let logoUrl = crestUrl;
    logoUrl = logoUrl.replace(/^https:\/\//i, 'http://');
    let teamNode = $('.team-template').clone();
    teamNode.removeClass('team-template');
    teamNode.addClass('team');
    teamNode.removeAttr('hidden');
    teamNode.attr('id', id);
    teamNode.find('.team-name').html(`${name} (${tla})`);
    teamNode.find('.team-name').html(`${name} (${tla})`);
    teamNode.find('.team-logo').attr('src', logoUrl);
    teamNode.find('.team-venue').html(venue);
    teamNode.find('.team-url').html(website);
    teamNode.find('.team-url').attr('href', website);
    teamNode.find('.team-url')[0].addEventListener('click', function (event) {
        event.stopPropagation();
    });
    teamNode[0].addEventListener('click', function () {
        console.log(`${team.name} was clicked`);
        $('.brand-logo').html(team.name);
        code = 'team' + team.id;
        window.location.assign('#' + code);
        loadPage(code);
    });
    teamNode.find('.btn-floating')[0]
        .addEventListener('click', addFavoriteTeam(team));
    return teamNode;
}

function parseAndCreateMatchNode(match) {
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    const {matchday, utcDate, awayTeam, id, score, homeTeam, competition} = match;
    let date = new Date(utcDate);
    let formattedDate = date.toLocaleString("en-US", options);

    let matchNode = $('.match-template').clone();
    matchNode.removeClass('match-template');
    matchNode.addClass('match');
    matchNode.removeAttr('hidden');
    matchNode.attr('id', id);
    matchNode.find('.match-competition-name').html(competition.name);
    matchNode.find('.match-day').html(matchday);
    matchNode.find('.match-date').html(formattedDate);
    const {awayTeam: awayTeam1, homeTeam: homeTeam1} = score.fullTime;
    matchNode.find('.home-team-score').html(checkNull(homeTeam1, "-"));
    matchNode.find('.home-team-name').html(homeTeam.name);
    matchNode.find('.away-team-score').html(checkNull(awayTeam1, "-"));
    matchNode.find('.away-team-name').html(awayTeam.name);
    matchNode.find('.btn-floating')[0]
        .addEventListener('click', addFavoriteMatch(match));
    return matchNode;
}

function gotoMatchPage(teamId) {
    getMatchesByTeamId(teamId, (json) => {
        console.log(json);

        $('#team-container').html("");
        json.matches.forEach((match) => {
            const matchNode = parseAndCreateMatchNode(match);
            $('#team-container').append(matchNode);
        });
    }, showErrorView)
        .then(updateAndCheckSavedMatches)
        .then(hideLoading);
}

function showEmptyText() {
    const empty = $('.empty-data').clone();
    $('#team-container').append(empty);
}

function setAsFavoriteButton(node) {
    let new_element = node.find(".btn-floating")[0].cloneNode(true);
    node.find(".btn-floating")[0].parentNode.replaceChild(new_element, node.find(".btn-floating")[0]);

    node.find('.fav').css('display', 'inline');
    node.find('.non-fav').css('display', 'none');
    return node;
}

function updateAndCheckSavedMatches() {
    loadFavoriteMatches((matches) => {
        console.log("favorite match");
        console.log(matches);
        matches.forEach((match) => {
            let matchNode = $('#' + match.id);
            if (matchNode.length > 0) {
                matchNode = setAsFavoriteButton(matchNode);
                matchNode.find(".btn-floating")[0]
                    .addEventListener('click', removeFavoriteMatch(code, match.id));
            }
        });
    })
}

function loadSavedMatchPage() {
    loadFavoriteMatches((data) => {
        $('#team-container').html("");
        console.log(data);

        if (data.length === 0) {
            showEmptyText();
            return;
        }

        data.forEach((match) => {
            let matchNode = parseAndCreateMatchNode(match);
            $('#team-container').append(matchNode);
        });
    })
        .then(updateAndCheckSavedMatches)
        .then(hideLoading);
}

function checkNull(value, whenNull) {
    if (value === null || value === undefined) return whenNull;
    return value;
}
