import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { RegisterForm, LoginForm, UseRequest, GridOffence } from "./api";
import "./index.css";
import { Bar } from "react-chartjs-2";
import { Map, TileLayer } from "react-leaflet";
import HeatmapLayer from 'react-leaflet-heatmap-layer';

/**
 * Creates a bar chart with props of LGA, total, showChart
 * @param {*} props string LGA, int total and showChart bool
 */
function Chart(props) {
  let crimeCount = [];
  let areaCount = [];

  // So that graph doesn't assign to first LGA if areaParam is specified
  props.searchResult.map(each => {
    crimeCount.push(each.total);
    areaCount.push(each.LGA);
  });

  const data = {
    labels: areaCount,
    datasets: [
      {
        label: "Offence count",
        data: crimeCount,
        backgroundColor: "rgba(255,99,132,1)",
        borderColor: "red",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)"
      }
    ]
  };

  if (props.showChart === false) {
    return null;
  }
  return (
    <div className="chart">
      <Bar data={data} />
    </div>
  );
}

/**
 * Fetch request for search 
 * @param {string} token token for authentication
 * @param {boolean} setsearchLoad whether search is completed
 * @param {setState} setResults set returned result to state
 * @param {setState} setFilterResults set filtered result to state
 * @param {string} searchParam offence parameter (required)
 * @param {string} areaParam area parameter
 * @param {string} ageParam age parameter
 * @param {string} genderParam gender parameter
 * @param {string} yearParam year parameter
 * @param {string} monthParam month parameter
 * 
 */
function searchRequest(token, setsearchLoad, setResults, setFilterResults, setFailedSearch, searchParam, areaParam, ageParam, genderParam, yearParam, monthParam) {
  // Generating url for get request
  let url = "https://localhost/search?offence=" + searchParam;
  if (areaParam !== "") {
    url += "&area=" + areaParam;
  }
  if (ageParam !== "") {
    url += "&age=" + ageParam;
  }
  if (genderParam !== "") {
    url += "&gender=" + genderParam;
  }
  if (yearParam !== "") {
    url += "&year=" + yearParam;
  }
  if (monthParam !== "") {
    url += "&month=" + monthParam;
  }
  fetch(url, {
    method: "GET",
    headers: {
      "Authorization": 'Bearer ' + token,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`Server sent ${response.status}`);
    })
    .then(result => {
      setsearchLoad(false);
      setResults(result.result);
      setFilterResults(result.result);
      return result;
    })
    .catch(function (error) {
      setsearchLoad(false);
      setResults([]);
      // Error catching different error codes
      if (error.toString() === "Error: Server sent 400") {
        setFailedSearch("You can't search for an empty offence!")
      }
      if (error.toString() === "Error: Server sent 401") {
        setFailedSearch("You're not logged in! How'd you get here?");
      }
      if (error.toString() === "Error: Server sent 500") {
        setFailedSearch("Please enter a valid offence!");
      }
    });
}


/**
 *  Generates drop down menu for search filters
 * @param {*} props set parameter state, name of filter, array of items that can be filtered and id
 */
function SearchFilter(props) {
  return (
    <div className="searchFilters">
      <select
        id={props.id}
        onChange={area => {
          const { value } = area.target;
          props.setParam(value);
        }}
      >
        <option value="" defaultValue>
          {props.filterBy}
        </option>
        {props.filter.map(search => (
          <option value={search} key={search}>
            {search}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Search component that allows filtering of search and display search 
 * @param {string} token for authentication
 * @param {setState} toggleOffence for toggling offence list
 */
function Search(props) {
  const [searchResult, setResults] = useState([]);
  const [searchFiltered, setFilterResults] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [areaParam, setAreaParam] = useState("");
  const [ageParam, setAgeParam] = useState("");
  const [genderParam, setGenderParam] = useState("");
  const [yearParam, setYearParam] = useState("");
  const [monthParam, setMonthParam] = useState("");


  const [firstSearch, setFirstSearch] = useState(true);
  const [failedSearch, setFailedSearch] = useState(null);

  const [searchLoad, setsearchLoad] = useState(false);

  // Fetch request for search filters
  const { areas } = UseRequest(
    "https://localhost/areas"
  );
  const { ages } = UseRequest(
    "https://localhost/ages"
  );
  const { years } = UseRequest(
    "https://localhost/years"
  );
  const { genders } = UseRequest(
    "https://localhost/genders"
  );


  return (
    <div className="Search">
      <form
        onSubmit={event => {
          if (searchParam === "") {
            props.toggleOffence();
          }
          event.preventDefault();
          setsearchLoad(true);
          setFirstSearch(false);
          searchRequest(props.token, setsearchLoad, setResults, setFilterResults, setFailedSearch, searchParam, areaParam, ageParam, genderParam, yearParam, monthParam);
          // setResults(search);
        }}
      >
        <label>Search Crime:</label>
        <input
          aria-labelledby="search-button"
          id="search"
          name="search"
          type="search"
          value={searchParam}
          onChange={searchEvent => {
            const { value } = searchEvent.target;
            setSearchParam(value);
          }}
        />
        <button
          type="submit"
          onClick={() => {
            setFailedSearch(null);
          }}
        >
          Search
        </button>


        <button
          type="button"
          onClick={() => {
            // Clear button that clears every parameter on click
            setResults([]);
            setFailedSearch(null);
            setsearchLoad(false);
            setSearchParam("");
            setAreaParam("");
            clearSearch("filterLGA");
            clearSearch("filterYear");
            clearSearch("filterAge");
            clearSearch("filterMonth");
            clearSearch("filterGender");
          }}
        >
          Clear search
        </button>
      </form>

      <SearchFilter
        setParam={setAreaParam}
        filterBy="Filter by Area"
        filter={areas}
        id="filterLGA"
      />
      <SearchFilter
        setParam={setAgeParam}
        filterBy="Filter by Age"
        filter={ages}
        id="filterAge"
      />
      <SearchFilter
        setParam={setYearParam}
        filterBy="Filter by Year"
        filter={years}
        id="filterYear"
      />
      <SearchFilter
        setParam={setMonthParam}
        filterBy="Filter by Month"
        filter={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
        id="filterMonth"
      />
      <SearchFilter
        setParam={setGenderParam}
        filterBy="Filter by Gender"
        filter={genders}
        id="filterGender"
      />
      <br />
      <br />
      <br />


      <DisplaySearch
        setResults={setResults}
        searchResult={searchResult}
        areas={areas}
        firstSearch={firstSearch}
        searchFiltered={searchFiltered}
      />

      {searchLoad ? <div className="loader" /> : null}

      {failedSearch !== null ? (
        <p className="errorMessage">{failedSearch}</p>
      ) : null}


    </div>
  );
}

/**
 * Function to clear each filter based on ID
 * @param {id} filterID id of filter that needs to be cleared
 */
function clearSearch(filterID) {
  let element = document.getElementById(filterID);
  element.value = "";
}

/**
 * Display search component with charts, maps and sortable tables
 * @param {*} props array of searchResults and filtered search, setState to set results after sorting, areas for chart labels
 * and boolean for tracking first search results which is empty
 */
function DisplaySearch(props) {
  const [showChart, setShowChart] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [sort, setSort] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const toggleChart = () => {
    showChart === false ? setShowChart(true) : setShowChart(false);
  };

  // Creating an array of lat + long for mapping
  let latLong = [];
  props.searchResult.map(search =>
    latLong.push([search.lat, search.lng, search.total])
  );
  const toggleMap = () => {
    showMap === false ? setShowMap(true) : setShowMap(false);

  };

  if (props.searchResult.length === 0 && props.firstSearch === false) {
    return <p className="errorMessage">Current search is empty</p>;
  }

  // Two sort functions that alternates between ascending/ descending 
  function sortHeader(e) {
    if (sorted) {
      props.searchResult.sort(function (a, b) {
        return a.total - b.total;
      });
    } else {
      props.searchResult.sort(function (a, b) {
        return b.total - a.total;
      });
    }
    setSorted(oldSorted => !oldSorted);
    props.setResults(props.searchResult);
  }

  function sortLGA(e) {
    if (sort) {

      props.searchResult.sort(function (a, b) {
        var textA = a.LGA.toUpperCase();
        var textB = b.LGA.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
    } else if (sort === false) {
      props.searchResult.sort(function (a, b) {
        var textA = a.LGA.toUpperCase();
        var textB = b.LGA.toUpperCase();
        return textA > textB ? -1 : textA < textB ? 1 : 0;
      });
    }
    setSort(oldSorted => !oldSorted);
    props.setResults(props.searchResult);
  }

  const filterList = event => {
    let updatedList = props.searchFiltered;
    updatedList = updatedList.filter(function (item) {
      return (
        item.LGA.toLowerCase().search(event.target.value.toLowerCase()) !== -1
      );
    });

    props.setResults(updatedList);
  };

  return (
    <div className="displaySearch">
      <div>
        <button onClick={toggleChart}> Toggle chart</button>
        <button onClick={toggleMap}> Toggle map</button>
      </div>
      <input
        type="text"
        className="form-control form-control-lg"
        placeholder="Filter by LGA"
        onChange={filterList}
      />
      <Chart
        searchResult={props.searchResult}
        areas={props.areas}
        showChart={showChart}
      />

      <Maps addressPoints={latLong} showMap={showMap} />

      <table id="resultTable">
        <thead>
          <tr>
            <th onClick={sortLGA}>LGA</th>
            <th onClick={sortHeader}>Total</th>
          </tr>
        </thead>
        {props.searchResult.map(search => (
          <tbody key={props.searchResult.indexOf(search)}>
            <tr>
              <td>{search.LGA}</td>
              <td>{search.total}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

/**
 * Creates a heatmap of total offences
 * @param {*} props accepts array of addressPoints and boolean to toggle map
 */
function Maps(props) {
  let radius = 8;
  let blur = 8;
  let max = 1;
  let minOpacity = 0.05;
  const gradient = {
    0.1: "#89BDE0",
    0.2: "#96E3E6",
    0.4: "#82CEB6",
    0.6: "#FAF3A5",
    0.8: "#F5D98B",
    "1.0": "#DE9A96"
  };

  if (props.showMap === false) {
    return null;
  }

  return (
    <div align="center">
      <Map center={[-10, 0]} zoom={3}>
        {props.addressPoints.length > 1 && (
          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={props.addressPoints}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            gradient={gradient}
            intensityExtractor={m => parseFloat(m[2])}
            radius={Number(radius)}
            blur={Number(blur)}
            max={Number.parseFloat(max)}
            minOpacity={minOpacity}
          />
        )}
        {props.addressPoints.length === 1 && (
          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={props.addressPoints}
            longitudeExtractor={m => props.addressPoints[0]}
            latitudeExtractor={m => props.addressPoints[1]}
            gradient={gradient}
            intensityExtractor={m => parseFloat(props.addressPoints[2])}
            radius={Number(radius)}
            blur={Number(blur)}
            max={Number.parseFloat(max)}
            minOpacity={minOpacity}
          />
        )}
        <TileLayer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map>
    </div>
  );
}

/**
 * Component that renders after logging in to allow search and display results
 * @param {*} props token for authentication, array of offences and toggle offence for display
 */
function AfterLoginPage(props) {
  if (props.token !== "") {
    return (
      <div className="lockLogin">
        <button id="offenceButton" onClick={props.toggleOffence}>
          Toggle offences
        </button>
        <GridOffence offenceList={props.offenceList} />
        <div className="lockLogin">
          <Search token={props.token} toggleOffence={props.toggleOffence} />
        </div>
      </div>
    );
  }

  return <div className="lockLogin" />;
}

function App() {
  document.title = "CAB203 Assignment";
  const [login, setLogin] = useState(true);
  const [offenceList, setOffences] = useState([]);
  const [token, setToken] = useState("");
  const [repopulateEmail, setEmail] = useState("");
  const [repopulatePassword, setPassword] = useState("");
  const { offences, error, loading } = UseRequest(
    "https://localhost/offences"
  );

  useEffect(() => {
    console.log(login);
  }, login)

  if (loading) {
    return (
      <div className="loader" />
    );
  }
  const handleToken = event => {
    setToken(event);
  };
  const clearToken = () => {
    setToken("");
  };
  const toggleOffence = () => {
    offenceList.length > 0 ? setOffences([]) : setOffences(offences);
  };

  const clearRepopulate = () => {
    setEmail("");
    setPassword("");
  }

  return (
    <div className="App">
      {login ? <LoginForm
        setLogin={setLogin}
        handleToken={handleToken}
        token={token}
        clearToken={clearToken}
        repopulateEmail={repopulateEmail}
        repopulatePassword={repopulatePassword}
        clearRepopulate={clearRepopulate}
      /> : <RegisterForm setLogin={setLogin} token={token} setEmail={setEmail} setPassword={setPassword} />}



      <AfterLoginPage
        token={token}
        offenceList={offenceList}
        toggleOffence={toggleOffence}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
