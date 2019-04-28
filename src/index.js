import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { RegisterForm, LoginForm, UseRequest, GridOffence } from "./api";
import "./index.css";
import { Bar } from 'react-chartjs-2';

// searchParam={searchParam} setFailedSearch={props.setFailedSearch} monthParam={monthParam} token={props.token}

function Chart(props) {
  const [monthlyData, setMonthlyData] = useState([]);
  let crimeCount = [];
  let areaCount = [];
  props.searchResult.map(each => {
    crimeCount.push(each.total)
    areaCount.push(each.LGA)  // So that graph doesn't assign to first LGA if areaParam is specified
  })



  const data = {
    labels: areaCount,
    datasets: [
      {
        label: 'Offence count',
        data: crimeCount,
        backgroundColor: 'rgba(255,99,132,1)',
        borderColor: 'red',
        borderWidth: 2,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
      }
    ]
  };

  if (props.showChart === false) {
    return null
  }
  return (
    < div className="chart" >
      {console.log(props.monthParam)}
      <Bar
        data={data}
      />
    </div >
  )

}

function searchRequest(token, setResults, setFailedSearch, setFirstSearch, searchParam, areaParam, ageParam, genderParam, yearParam, monthParam) {
  let url = "https://cab230.hackhouse.sh/search?offence=" + searchParam;
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
      Authorization:
        "Bearer " +
        token,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok");
    })
    .then(result => {
      setResults(result.result);
      setFirstSearch(false);
      return result;
    })
    .catch(function (error) {
      setResults([]);
      setFailedSearch("Your search parameters are invalid");
      console.log(
        "There has been a problem with your fetch operation: "
      );
    });

}

function SearchFilter(props) {
  return (
    <div className="searchFilters">
      <select id={props.id}
        onChange={area => {
          const { value } = area.target;
          props.setParam(value);
        }}>
        <option value="" defaultValue>{props.filterBy}</option>
        {props.filter.map(search => (
          <option value={search} key={(search)}>{search}</option>
        ))}
      </select>
    </div>
  )
}

function Search(props) {
  const [searchResult, setResults] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [areaParam, setAreaParam] = useState("");
  const [ageParam, setAgeParam] = useState("");
  const [genderParam, setGenderParam] = useState("");
  const [yearParam, setYearParam] = useState("");
  const [monthParam, setMonthParam] = useState("");
  const [firstSearch, setFirstSearch] = useState(true);

  const { areas, areaError, areaLoading } = UseRequest("https://cab230.hackhouse.sh/areas");
  const { ages, ageError, ageLoading } = UseRequest("https://cab230.hackhouse.sh/ages");
  const { years, yearError, yearLoading } = UseRequest("https://cab230.hackhouse.sh/years");
  const { genders, genderError, genderLoading } = UseRequest("https://cab230.hackhouse.sh/genders");

  const [failedSearch, setFailedSearch] = useState(null);

  if (props.token === "") {
    return (<p>Login to search</p>)
  }

  return (
    <div>
      <form
        onSubmit={event => {
          event.preventDefault();
          searchRequest(props.token, setResults, setFailedSearch, setFirstSearch, searchParam, areaParam, ageParam, genderParam, yearParam, monthParam);
        }}
      >
        <label >Search Crime:</label>
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
        <button type="submit" onClick={() => setFailedSearch(null)}>Search</button>

        <button type="button" onClick={() => {
          setResults([]);
          setFailedSearch(null);
          setFirstSearch(true);
          setSearchParam("");
          setAreaParam("");
          clearSearch("filterLGA");
          clearSearch("filterYear");
          clearSearch("filterAge");
          clearSearch("filterMonth");
          clearSearch("filterGender");
        }
        }>Clear search</button>
      </form>

      <DisplaySearch searchResult={searchResult} areas={areas} firstSearch={firstSearch} />

      <SearchFilter setParam={setAreaParam} filterBy="Filter by Area" filter={areas} id="filterLGA" />
      <SearchFilter setParam={setAgeParam} filterBy="Filter by Age" filter={ages} id="filterAge" />
      <SearchFilter setParam={setYearParam} filterBy="Filter by Year" filter={years} id="filterYear" />
      <SearchFilter setParam={setMonthParam} filterBy="Filter by Month" filter={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} id="filterMonth" />
      <SearchFilter setParam={setGenderParam} filterBy="Filter by Gender" filter={genders} id="filterGender" by="By Gender:" />



      {failedSearch !== null ? <p className="emptySearch">{failedSearch}</p> : null}
    </div >
  );
}

function clearSearch(filterID) {
  let element = document.getElementById(filterID);
  element.value = "";
}

function DisplaySearch(props) {
  const [LGA, setLGA] = useState("");
  const [showChart, setShowChart] = useState(false);

  const toggleChart = () => {
    showChart === false ? setShowChart(true) : setShowChart(false)
  }

  if (props.searchResult.length === 0 && props.firstSearch === true) {
    return <p className="emptySearch"></p>
  }

  if (props.searchResult.length === 0 && props.firstSearch === false) {
    return <p className="emptySearch">Current search is empty</p>
  }

  return (
    <div>
      <button onClick={toggleChart}> Toggle chart</button>
      <Chart searchResult={props.searchResult} areas={props.areas} showChart={showChart} />
      <table align="center">
        <thead>
          <tr>
            <th>LGA</th>
            <th>Total</th>
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
    </div >
  )
}

function AfterLoginPage(props) {
  if (props.token !== "") {
    return (
      <div className="lockLogin">
        <button id="offenceButton" onClick={props.toggleOffence}>Toggle offences</button>
        <GridOffence offenceList={props.offenceList} />
        <div className="lockLogin">
          <Search token={props.token} />
        </div>
      </div>

    )
  }

  return (
    <div className="lockLogin"></div>
  )
}

function App() {
  const [offenceList, setOffences] = useState([]);
  const [token, setToken] = useState("");
  const { offences, error, loading } = UseRequest("https://cab230.hackhouse.sh/offences");


  if (loading) {
    return <h1>Loading...</h1>
  }

  const handleToken = (event) => {
    setToken(event);
  }

  const clearToken = () => {
    setToken("")
  }

  const toggleOffence = () => { offenceList.length > 0 ? setOffences([]) : setOffences(offences) }

  return (
    < div className="App" >

      <RegisterForm token={token} />
      <LoginForm handleToken={handleToken} token={token} clearToken={clearToken} />

      <AfterLoginPage token={token} offenceList={offenceList} toggleOffence={toggleOffence} />
    </div >


  );
}



const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
